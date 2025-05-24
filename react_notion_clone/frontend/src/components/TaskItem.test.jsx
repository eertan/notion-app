import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskItem from './TaskItem';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';

const theme = createTheme();

describe('TaskItem', () => {
  const mockTask = {
    id: 't1',
    title: 'Test Task Title',
    dueDate: new Date().toISOString(),
    completed: false,
  };
  const onToggleCompleteMock = vi.fn();
  const onEditMock = vi.fn();
  const onDeleteMock = vi.fn();

  const renderTaskItem = (task = mockTask) => {
    return render(
      <ThemeProvider theme={theme}>
        <TaskItem
          task={task}
          onToggleComplete={onToggleCompleteMock}
          onEdit={onEditMock}
          onDelete={onDeleteMock}
        />
      </ThemeProvider>
    );
  };

  it('renders task title correctly', () => {
    renderTaskItem();
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
  });

  it('renders formatted due date', () => {
    renderTaskItem();
    const formattedDate = format(parseISO(mockTask.dueDate), 'P');
    expect(screen.getByText(`Due: ${formattedDate}`)).toBeInTheDocument();
  });
  
  it('renders "No due date" if dueDate is null', () => {
    renderTaskItem({ ...mockTask, dueDate: null });
    expect(screen.getByText('Due: No due date')).toBeInTheDocument();
  });


  it('checkbox is unchecked for incomplete task', () => {
    renderTaskItem({ ...mockTask, completed: false });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('checkbox is checked for completed task', () => {
    renderTaskItem({ ...mockTask, completed: true });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('applies line-through style for completed task title', () => {
    renderTaskItem({ ...mockTask, completed: true });
    const titleElement = screen.getByText(mockTask.title);
    expect(titleElement).toHaveStyle('text-decoration: line-through');
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    renderTaskItem();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggleCompleteMock).toHaveBeenCalledTimes(1);
    expect(onToggleCompleteMock).toHaveBeenCalledWith({ ...mockTask, completed: !mockTask.completed });
  });

  it('calls onEdit when Edit button is clicked', () => {
    renderTaskItem();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when Delete button is clicked', () => {
    renderTaskItem();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(mockTask.id);
  });
});
