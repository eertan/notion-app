import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns'; // Ensure date-fns is installed

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const { id, title, dueDate, completed } = task;

  const handleToggle = () => {
    onToggleComplete({ ...task, completed: !completed });
  };

  let formattedDueDate = 'No due date';
  if (dueDate) {
    try {
      // Assuming dueDate is in 'YYYY-MM-DD' or ISO format from the backend
      const date = parseISO(dueDate); // Handles ISO strings like "2023-10-26T00:00:00.000Z" or "2023-10-26"
      formattedDueDate = format(date, 'P'); // 'P' is a short date format like "10/26/2023"
    } catch (error) {
      console.error("Error parsing due date:", error);
      formattedDueDate = dueDate; // Fallback to original string if parsing fails
    }
  }
  
  return (
    <ListItem
      key={id}
      disablePadding
      sx={{
        mb: 1,
        backgroundColor: completed ? 'action.disabledBackground' : 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 3,
        },
      }}
      secondaryAction={
        <Box>
          <IconButton edge="end" aria-label="edit" onClick={() => onEdit(task)} sx={{ mr: 0.5 }}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => onDelete(id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      }
    >
      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, ml: 1 }}>
        <Checkbox
          edge="start"
          checked={completed}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': `checkbox-list-label-${id}` }}
          onChange={handleToggle}
        />
      </ListItemIcon>
      <ListItemText
        id={`checkbox-list-label-${id}`}
        primary={
          <Typography
            variant="body1"
            sx={{ textDecoration: completed ? 'line-through' : 'none', wordBreak: 'break-word' }}
          >
            {title}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            Due: {formattedDueDate}
          </Typography>
        }
      />
    </ListItem>
  );
};

export default TaskItem;
