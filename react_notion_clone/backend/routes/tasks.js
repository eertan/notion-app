const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { query } = require('../db'); // Import the query function from db.js

const router = express.Router();

// In-memory store for tasks (for simulation) - REMOVED
// let tasks = [];
// let nextTaskId = 1;

// Apply protect middleware to all routes in this file
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userTasksResult = await query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(userTasksResult.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error.stack);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for the authenticated user
 * @access  Private
 */
router.post('/', async (req, res) => {
  const { title, description = '', dueDate = null } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Optional: Validate dueDate format if provided
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    // return res.status(400).json({ message: 'Invalid dueDate format. Use YYYY-MM-DD.' });
    // For now, we'll allow flexible string, but in a real app, parse or validate
  }

  try {
    // dueDate is optional; handle null or valid date
    const validDueDate = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;

    const insertTaskResult = await query(
      'INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, validDueDate]
    );
    // The RETURNING * clause will include created_at, updated_at, and completed (default false)
    res.status(201).json(insertTaskResult.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error.stack);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task for the authenticated user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, dueDate, completed } = req.body;
  const userId = req.user.id;

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }

  // At least one field must be provided for an update
  if (title === undefined && description === undefined && dueDate === undefined && completed === undefined) {
    return res.status(400).json({ message: 'Please provide at least one field to update (title, description, dueDate, completed)' });
  }
  
  try {
    // Fetch the task first to ensure it exists and belongs to the user
    const taskCheckResult = await query('SELECT user_id FROM tasks WHERE id = $1', [taskId]);
    if (taskCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (taskCheckResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this task' });
    }

    // Dynamically build the update query
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      queryParams.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      queryParams.push(description);
    }
    if (dueDate !== undefined) { // Allow setting dueDate to null
      const validDueDate = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;
      updateFields.push(`due_date = $${paramIndex++}`);
      queryParams.push(validDueDate);
    }
    if (completed !== undefined) {
      updateFields.push(`completed = $${paramIndex++}`);
      queryParams.push(completed);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    queryParams.push(taskId);
    queryParams.push(userId); // For the WHERE clause

    const updateQueryText = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *`;
    
    const updateResult = await query(updateQueryText, queryParams);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or user not authorized during update' });
    }
    res.json(updateResult.rows[0]);

  } catch (error) {
    console.error('Error updating task:', error.stack);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task for the authenticated user
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }

  try {
    // Fetch the task first to ensure it exists and belongs to the user (optional but safer)
    const taskCheckResult = await query('SELECT user_id FROM tasks WHERE id = $1', [taskId]);
    if (taskCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (taskCheckResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this task' });
    }

    const deleteResult = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found or user not authorized during delete' });
    }
    // res.status(204).send(); // Standard for successful deletion
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.stack);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

module.exports = router;
