const express = require('express');
const { protect } = require('../middleware/authMiddleware');
// const pool = require('../db'); // Will be used later for DB interactions

const router = express.Router();

// In-memory store for tasks (for simulation)
let tasks = [];
let nextTaskId = 1; // Simple ID generation

// Apply protect middleware to all routes in this file
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    // Simulate fetching tasks for the user from a database
    // In a real app: const userTasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY updated_at DESC', [req.user.id]);
    // res.json(userTasks.rows);
    
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    res.json(userTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const now = new Date().toISOString();
    const newTask = {
      id: nextTaskId++,
      userId,
      title,
      description,
      dueDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    // Simulate saving to database
    // In a real app: const result = await pool.query(
    //   'INSERT INTO tasks (user_id, title, description, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    //   [userId, title, description, dueDate, now, now]
    // );
    // res.status(201).json(result.rows[0]);
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
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
    // Simulate finding the task by ID
    // In a real app: const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    // if (taskResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Task not found' });
    // }
    // const task = taskResult.rows[0];

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found (simulated)' });
    }

    let task = tasks[taskIndex];

    // Check if the task belongs to the user
    if (task.userId !== userId) {
      // In a real app, this check is crucial (SELECT * FROM tasks WHERE id = $1 AND user_id = $2)
      return res.status(403).json({ message: 'User not authorized to update this task' });
    }

    // Update fields
    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDescription = description !== undefined ? description : task.description;
    const updatedDueDate = dueDate !== undefined ? dueDate : task.dueDate;
    const updatedCompleted = completed !== undefined ? completed : task.completed;
    const updatedAt = new Date().toISOString();

    // Simulate updating in database
    // In a real app: const updateResult = await pool.query(
    //   'UPDATE tasks SET title = $1, description = $2, due_date = $3, completed = $4, updated_at = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
    //   [updatedTitle, updatedDescription, updatedDueDate, updatedCompleted, updatedAt, taskId, userId]
    // );
    // if (updateResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Task not found or user not authorized' });
    // }
    // res.json(updateResult.rows[0]);

    tasks[taskIndex] = { 
      ...task, 
      title: updatedTitle, 
      description: updatedDescription, 
      dueDate: updatedDueDate,
      completed: updatedCompleted,
      updatedAt 
    };
    res.json(tasks[taskIndex]);

  } catch (error) {
    console.error('Error updating task:', error);
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
    // Simulate finding the task by ID
    // In a real app: const taskResult = await pool.query('SELECT user_id FROM tasks WHERE id = $1', [taskId]);
    // if (taskResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Task not found' });
    // }
    // const taskOwner = taskResult.rows[0].user_id;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found (simulated)' });
    }

    const task = tasks[taskIndex];

    // Check if the task belongs to the user
    if (task.userId !== userId) {
       // In a real app: DELETE FROM tasks WHERE id = $1 AND user_id = $2
      return res.status(403).json({ message: 'User not authorized to delete this task' });
    }

    // Simulate deleting from database
    // In a real app: const deleteResult = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [taskId, userId]);
    // if (deleteResult.rowCount === 0) {
    //   return res.status(404).json({ message: 'Task not found or user not authorized' });
    // }
    // res.status(204).send(); // No content for successful deletion

    tasks = tasks.filter(t => t.id !== taskId);
    res.status(200).json({ message: 'Task deleted successfully (simulated)'}); // Or res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

module.exports = router;
