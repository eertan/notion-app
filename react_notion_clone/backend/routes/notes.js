const express = require('express');
const { protect } = require('../middleware/authMiddleware');
// const pool = require('../db'); // Will be used later for DB interactions

const router = express.Router();

// In-memory store for notes (for simulation)
let notes = [];
let nextNoteId = 1; // Simple ID generation

// Apply protect middleware to all routes in this file
router.use(protect);

/**
 * @route   GET /api/notes
 * @desc    Get all notes for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    // Simulate fetching notes for the user from a database
    // In a real app: const userNotes = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.user.id]);
    // res.json(userNotes.rows);
    
    const userNotes = notes.filter(note => note.userId === req.user.id);
    res.json(userNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
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
    const now = new Date().toISOString();
    const newNote = {
      id: nextNoteId++,
      userId,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };

    // Simulate saving to database
    // In a real app: const result = await pool.query(
    //   'INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    //   [userId, title, content, now, now]
    // );
    // res.status(201).json(result.rows[0]);
    
    notes.push(newNote);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
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
    // Simulate finding the note by ID
    // In a real app: const noteResult = await pool.query('SELECT * FROM notes WHERE id = $1', [noteId]);
    // if (noteResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Note not found' });
    // }
    // const note = noteResult.rows[0];

    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found (simulated)' });
    }

    let note = notes[noteIndex];

    // Check if the note belongs to the user
    if (note.userId !== userId) {
      // In a real app, this check is crucial (SELECT * FROM notes WHERE id = $1 AND user_id = $2)
      return res.status(403).json({ message: 'User not authorized to update this note' });
    }

    // Update fields
    const updatedTitle = title !== undefined ? title : note.title;
    const updatedContent = content !== undefined ? content : note.content;
    const updatedAt = new Date().toISOString();

    // Simulate updating in database
    // In a real app: const updateResult = await pool.query(
    //   'UPDATE notes SET title = $1, content = $2, updated_at = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
    //   [updatedTitle, updatedContent, updatedAt, noteId, userId]
    // );
    // if (updateResult.rows.length === 0) {
    //    // This case should ideally be caught by the initial check or a row count check after update
    //   return res.status(404).json({ message: 'Note not found or user not authorized' });
    // }
    // res.json(updateResult.rows[0]);

    notes[noteIndex] = { ...note, title: updatedTitle, content: updatedContent, updatedAt };
    res.json(notes[noteIndex]);

  } catch (error) {
    console.error('Error updating note:', error);
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
    // Simulate finding the note by ID
    // In a real app: const noteResult = await pool.query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
    // if (noteResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Note not found' });
    // }
    // const noteOwner = noteResult.rows[0].user_id;

    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found (simulated)' });
    }

    const note = notes[noteIndex];

    // Check if the note belongs to the user
    if (note.userId !== userId) {
       // In a real app: DELETE FROM notes WHERE id = $1 AND user_id = $2
      return res.status(403).json({ message: 'User not authorized to delete this note' });
    }

    // Simulate deleting from database
    // In a real app: const deleteResult = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [noteId, userId]);
    // if (deleteResult.rowCount === 0) {
    //    // This case should ideally be caught by the initial check
    //   return res.status(404).json({ message: 'Note not found or user not authorized' });
    // }
    // res.status(204).send();

    notes = notes.filter(n => n.id !== noteId);
    res.status(200).json({ message: 'Note deleted successfully (simulated)'}); // Or res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error while deleting note' });
  }
});

module.exports = router;
