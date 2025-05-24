import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListSubheader,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import CalendarView from '../components/CalendarView'; // Assuming this is created
import { useAuth } from '../context/AuthContext';
import { format, parseISO, startOfDay, isPast, isToday, isFuture } from 'date-fns';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // Task being edited or null for new
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const { user } = useAuth(); // For potential auth error handling

  const fetchUserTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message || 'Failed to fetch tasks. Please try again.');
      setSnackbar({ open: true, message: err.message || 'Failed to fetch tasks.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  const handleOpenTaskForm = (task = null) => {
    setCurrentTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setCurrentTask(null);
    setShowTaskForm(false);
  };

  const handleSaveTask = async (taskData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (currentTask && currentTask.id) {
        await updateTask(currentTask.id, taskData);
        setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      } else {
        await createTask(taskData);
        setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
      }
      await fetchUserTasks(); // Refresh tasks list
      handleCloseTaskForm();
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err.message || 'Failed to save task.');
      setSnackbar({ open: true, message: err.message || 'Failed to save task.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteTask(taskId);
        setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
        await fetchUserTasks();
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError(err.message || 'Failed to delete task.');
        setSnackbar({ open: true, message: err.message || 'Failed to delete task.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleComplete = async (taskToUpdate) => {
    // No need for setIsLoading(true) here, as it's an optimistic update on UI then API call
    // This provides a snappier UI experience.
    // If the API call fails, we could revert, but for now, we'll assume success for UI.
    try {
      await updateTask(taskToUpdate.id, { ...taskToUpdate, completed: taskToUpdate.completed });
      setTasks(prevTasks => prevTasks.map(t => t.id === taskToUpdate.id ? taskToUpdate : t));
      // Optionally show a snackbar for success
      // setSnackbar({ open: true, message: 'Task status updated!', severity: 'success' });
    } catch (err) {
      console.error('Failed to update task status:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to update task status.', severity: 'error' });
      // Optionally revert the change in UI if API call fails
      // fetchUserTasks(); // Or revert manually
    }
  };
  
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const groupedTasks = useMemo(() => {
    const groups = {
      overdue: [],
      today: [],
      upcoming: [],
      noDate: [],
    };

    tasks.forEach(task => {
      if (task.completed) return; // Don't group completed tasks in these categories for list view

      if (!task.dueDate) {
        groups.noDate.push(task);
      } else {
        try {
          const dueDate = startOfDay(parseISO(task.dueDate));
          if (isPast(dueDate) && !isToday(dueDate)) {
            groups.overdue.push(task);
          } else if (isToday(dueDate)) {
            groups.today.push(task);
          } else if (isFuture(dueDate)) {
            groups.upcoming.push(task);
          } else { // Should not happen if logic is correct
             groups.noDate.push(task);
          }
        } catch(e) {
            console.warn("Error parsing due date for grouping:", task.dueDate, e);
            groups.noDate.push(task);
        }
      }
    });
    // Sort tasks within groups (e.g., by due date or title)
    for (const key in groups) {
        groups[key].sort((a, b) => {
            if (a.dueDate && b.dueDate) return parseISO(a.dueDate) - parseISO(b.dueDate);
            if (a.dueDate) return -1; // tasks with due dates first
            if (b.dueDate) return 1;
            return a.title.localeCompare(b.title); // then by title
        });
    }
    return groups;
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.completed).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [tasks]);


  if (isLoading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  const renderTaskList = (taskList, title) => (
    taskList.length > 0 && (
      <Accordion defaultExpanded={title !== 'Completed'}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{title} ({taskList.length})</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{p:0}}>
          <List sx={{ width: '100%', bgcolor: 'background.paper', p:0 }}>
            {taskList.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={() => handleOpenTaskForm(task)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    )
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenTaskForm(null)}
        >
          Add New Task
        </Button>
      </Box>

      <Box mb={3} display="flex" justifyContent="center">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 1 }} />
            List
          </ToggleButton>
          <ToggleButton value="calendar" aria-label="calendar view">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Calendar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && tasks.length > 0 && <CircularProgress sx={{display: 'block', margin: 'auto', mb: 2}}/>}


      {viewMode === 'list' ? (
        <>
          {tasks.length === 0 && !isLoading ? (
            <Typography variant="subtitle1" textAlign="center" sx={{ mt: 4 }}>
              You don't have any tasks yet. Click "Add New Task" to get started!
            </Typography>
          ) : (
            <>
              {renderTaskList(groupedTasks.overdue, 'Overdue')}
              {renderTaskList(groupedTasks.today, 'Today')}
              {renderTaskList(groupedTasks.upcoming, 'Upcoming')}
              {renderTaskList(groupedTasks.noDate, 'No Due Date')}
              {renderTaskList(completedTasks, 'Completed')}
            </>
          )}
        </>
      ) : ( // Calendar View
        <CalendarView 
            tasks={tasks} 
            onTaskClick={(task) => handleOpenTaskForm(task)} 
            onDateClick={(date) => handleOpenTaskForm({dueDate: date.toISOString()})} // Pre-fill due date
        />
      )}

      <TaskForm
        open={showTaskForm}
        onClose={handleCloseTaskForm}
        onSubmit={handleSaveTask}
        initialTask={currentTask}
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

export default TasksPage;
