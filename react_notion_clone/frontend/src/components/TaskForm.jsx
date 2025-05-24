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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { format } from 'date-fns'; // For formatting date for input type="date"

const TaskForm = ({ open, onClose, onSubmit, initialTask, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false); // Added for editing existing tasks

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      // Ensure dueDate is in 'yyyy-MM-dd' format for the input type="date"
      setDueDate(initialTask.dueDate ? format(new Date(initialTask.dueDate), 'yyyy-MM-dd') : '');
      setCompleted(initialTask.completed || false);
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setCompleted(false);
    }
  }, [initialTask, open]); // Depend on `open` to reset form when dialog reopens

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    // Prepare task data
    const taskData = { 
      title, 
      description, 
      // Send null if dueDate is empty, otherwise ensure it's a valid date string or ISO format
      dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
    };
    // Only include 'completed' status if it's an existing task being edited
    if (initialTask && initialTask.id) {
      taskData.completed = completed;
    }

    onSubmit(taskData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {initialTask
              ? 'Update the details of your task.'
              : 'Fill in the details for your new task.'}
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
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="dueDate"
            label="Due Date"
            type="date" // Simple date input
            fullWidth
            variant="outlined"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          {initialTask && ( // Only show completed checkbox if editing
            <FormControlLabel
              control={
                <Checkbox
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  name="completed"
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Completed"
            />
          )}
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

export default TaskForm;
