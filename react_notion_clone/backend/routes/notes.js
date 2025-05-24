const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { query } = require('../db'); // Import the query function from db.js

const router = express.Router();

// In-memory store for notes (for simulation) - REMOVED
// let notes = [];
// let nextNoteId = 1;

// Apply protect middleware to all routes in this file
router.use(protect);

/**
 * @route   GET /api/notes
 * @desc    Get all notes for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userNotesResult = await query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(userNotesResult.rows);
  } catch (error) {
    console.error('Error fetching notes:', error.stack);
    res.status(500).json({ message: 'Server error while fetching notes' });
  }
});

/**
 * @route   POST /api/notes
 * @desc    Create a new note for the authenticated user
 * @access  Private
 */
router.post('/', async (req, res) => {
  const { title, content = '' } = req.body; // content is optional
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const insertNoteResult = await query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );
    // The RETURNING * clause will include created_at and updated_at from DB defaults
    res.status(201).json(insertNoteResult.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error.stack);
    res.status(500).json({ message: 'Server error while creating note' });
  }
});

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note for the authenticated user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const { title, content } = req.body;
  const userId = req.user.id;

  if (isNaN(noteId)) {
    return res.status(400).json({ message: 'Invalid note ID format' });
  }

  // Title or content must be provided for an update
  if (title === undefined && content === undefined) {
    return res.status(400).json({ message: 'Please provide title or content to update' });
  }
  
  try {
    // Fetch the note first to ensure it exists and belongs to the user
    const noteCheckResult = await query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
    if (noteCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (noteCheckResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this note' });
    }

    // Dynamically build the update query based on provided fields
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      queryParams.push(title);
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      queryParams.push(content);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    queryParams.push(noteId);
    queryParams.push(userId); // For the WHERE clause

    const updateQuery = `UPDATE notes SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *`;
    
    const updateResult = await query(updateQuery, queryParams);

    if (updateResult.rows.length === 0) {
      // This should ideally be caught by the initial check, but as a safeguard
      return res.status(404).json({ message: 'Note not found or user not authorized during update' });
    }
    res.json(updateResult.rows[0]);

  } catch (error) {
    console.error('Error updating note:', error.stack);
    res.status(500).json({ message: 'Server error while updating note' });
  }
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note for the authenticated user
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(noteId)) {
    return res.status(400).json({ message: 'Invalid note ID format' });
  }

  try {
    // Fetch the note first to ensure it exists and belongs to the user (optional but safer)
    const noteCheckResult = await query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
    if (noteCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (noteCheckResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this note' });
    }

    const deleteResult = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, userId]
    );

    if (deleteResult.rowCount === 0) {
      // This case should ideally be caught by the initial checks
      return res.status(404).json({ message: 'Note not found or user not authorized during delete' });
    }
    // res.status(204).send(); // Standard for successful deletion with no content
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error.stack);
    res.status(500).json({ message: 'Server error while deleting note' });
  }
});

module.exports = router;
