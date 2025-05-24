import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';

const CalendarView = ({ tasks = [], onTaskClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        try {
            const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
            grouped[dateKey] = [];
            }
            grouped[dateKey].push(task);
        } catch (e) {
            console.error("Error parsing task due date for calendar:", task.dueDate, e);
        }
      }
    });
    return grouped;
  }, [tasks]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Paper elevation={3} sx={{ p: 2, overflow: 'auto' }}>
      {/* Header: Month/Year and Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={handlePrevMonth} aria-label="previous month">
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h5" component="div">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth} aria-label="next month">
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Day Names Header */}
      <Grid container spacing={0.5} sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        {dayNames.map((day) => (
          <Grid item xs={12/7} key={day} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">{day}</Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Grid */}
      <Grid container spacing={0.5}>
        {daysInMonth.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const tasksForDay = tasksByDate[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <Grid item xs={12/7} key={day.toString()} sx={{ minHeight: 120 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 0.5,
                  height: '100%',
                  opacity: isCurrentMonth ? 1 : 0.6,
                  backgroundColor: isSameDay(day, new Date()) ? 'action.hover' : 'transparent',
                  cursor: onDateClick ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => onDateClick && onDateClick(day)}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal', textAlign: 'right' }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 80, '&::-webkit-scrollbar': {width: '4px'}, '&::-webkit-scrollbar-thumb': {backgroundColor: 'divider'} }}>
                  {tasksForDay.map((task) => (
                    <Tooltip title={task.title} key={task.id} placement="top">
                      <Chip
                        label={task.title.substring(0,10) + (task.title.length > 10 ? '...' : '')}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent onDateClick if onTaskClick is handled
                            onTaskClick && onTaskClick(task);
                        }}
                        sx={{
                          mb: 0.5,
                          width: '100%',
                          backgroundColor: task.completed ? 'success.light' : 'primary.light',
                          color: task.completed ? 'success.contrastText' : 'primary.contrastText',
                          cursor: onTaskClick ? 'pointer' : 'default',
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default CalendarView;
