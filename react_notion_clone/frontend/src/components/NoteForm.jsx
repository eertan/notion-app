import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

const NoteForm = ({ open, onClose, onSubmit, initialNote, isLoading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
    } else {
      // Reset for new note
      setTitle('');
      setContent('');
    }
  }, [initialNote, open]); // Depend on `open` to reset form when dialog reopens for a new note

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      // Basic validation: title should not be empty or just whitespace
      // You could add more sophisticated validation here (e.g., using a state for error messages)
      alert('Title is required.');
      return;
    }
    onSubmit({ title, content });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {initialNote
              ? 'Update the details of your note.'
              : 'Fill in the details for your new note.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="content"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} disabled={isLoading} color="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} variant="contained">
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NoteForm;
