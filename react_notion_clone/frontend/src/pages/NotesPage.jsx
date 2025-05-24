import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getNotes, createNote, updateNote, deleteNote } from '../services/api';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import { useAuth } from '../context/AuthContext'; // To handle potential auth errors

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [currentNote, setCurrentNote] = useState(null); // Note being edited or null for new
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [sortOption, setSortOption] = useState('updatedAt_desc'); // Default sort

  const { user } = useAuth(); // Get user info if needed, or for error handling

  const fetchUserNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err.message || 'Failed to fetch notes. Please try again.');
      setSnackbar({ open: true, message: err.message || 'Failed to fetch notes.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserNotes();
  }, [fetchUserNotes]);

  const handleOpenNoteForm = (note = null) => {
    setCurrentNote(note);
    setShowNoteForm(true);
  };

  const handleCloseNoteForm = () => {
    setCurrentNote(null);
    setShowNoteForm(false);
  };

  const handleSaveNote = async (noteData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (currentNote && currentNote.id) {
        await updateNote(currentNote.id, noteData);
        setSnackbar({ open: true, message: 'Note updated successfully!', severity: 'success' });
      } else {
        await createNote(noteData);
        setSnackbar({ open: true, message: 'Note created successfully!', severity: 'success' });
      }
      await fetchUserNotes(); // Refresh notes list
      handleCloseNoteForm();
    } catch (err) {
      console.error('Failed to save note:', err);
      setError(err.message || 'Failed to save note.');
      setSnackbar({ open: true, message: err.message || 'Failed to save note.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true); // Indicate loading for delete operation
      setError(null);
      try {
        await deleteNote(noteId);
        setSnackbar({ open: true, message: 'Note deleted successfully!', severity: 'success' });
        await fetchUserNotes(); // Refresh notes list
      } catch (err) {
        console.error('Failed to delete note:', err);
        setError(err.message || 'Failed to delete note.');
        setSnackbar({ open: true, message: err.message || 'Failed to delete note.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedNotes = useMemo(() => {
    let sortableNotes = [...notes];
    const [key, order] = sortOption.split('_');

    sortableNotes.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'title') {
        valA = valA?.toLowerCase() || '';
        valB = valB?.toLowerCase() || '';
      } else if (key === 'createdAt' || key === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableNotes;
  }, [notes, sortOption]);

  if (isLoading && notes.length === 0) { // Show main loader only on initial load
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenNoteForm(null)}
        >
          Create New Note
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
        <InputLabel id="sort-notes-label">Sort By</InputLabel>
        <Select
          labelId="sort-notes-label"
          id="sort-notes-select"
          value={sortOption}
          label="Sort By"
          onChange={handleSortChange}
        >
          <MenuItem value="updatedAt_desc">Last Modified (Newest First)</MenuItem>
          <MenuItem value="updatedAt_asc">Last Modified (Oldest First)</MenuItem>
          <MenuItem value="createdAt_desc">Created (Newest First)</MenuItem>
          <MenuItem value="createdAt_asc">Created (Oldest First)</MenuItem>
          <MenuItem value="title_asc">Name (A-Z)</MenuItem>
          <MenuItem value="title_desc">Name (Z-A)</MenuItem>
        </Select>
      </FormControl>

      {isLoading && notes.length > 0 && <CircularProgress sx={{display: 'block', margin: 'auto', mb: 2}}/>}

      {sortedNotes.length === 0 && !isLoading ? (
        <Typography variant="subtitle1" textAlign="center" sx={{ mt: 4 }}>
          You don't have any notes yet. Click "Create New Note" to get started!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {sortedNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard
                note={note}
                onEdit={() => handleOpenNoteForm(note)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <NoteForm
        open={showNoteForm}
        onClose={handleCloseNoteForm}
        onSubmit={handleSaveNote}
        initialNote={currentNote}
        isLoading={isSubmitting}
      />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotesPage;
