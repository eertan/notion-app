import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NoteCard from './NoteCard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { format } from 'date-fns';

const theme = createTheme();

// Mock date-fns to ensure consistent date formatting if not already handled by setup
// vitest.mock('date-fns', async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     ...actual,
//     format: (date, formatString) => actual.format(new Date(date), formatString), // Ensure date is Date object
//   };
// });


describe('NoteCard', () => {
  const mockNote = {
    id: '1',
    title: 'Test Note Title',
    content: 'This is the full content of the test note, which is longer than 100 characters to test the snippet functionality effectively.',
    updatedAt: new Date().toISOString(),
  };
  const onEditMock = vi.fn();
  const onDeleteMock = vi.fn();

  const renderNoteCard = () => {
    return render(
      <ThemeProvider theme={theme}>
        <NoteCard note={mockNote} onEdit={onEditMock} onDelete={onDeleteMock} />
      </ThemeProvider>
    );
  };

  it('renders note title correctly', () => {
    renderNoteCard();
    expect(screen.getByText(mockNote.title)).toBeInTheDocument();
  });

  it('renders note content snippet correctly', () => {
    renderNoteCard();
    const expectedSnippet = mockNote.content.substring(0, 100) + '...';
    expect(screen.getByText(expectedSnippet)).toBeInTheDocument();
  });

  it('renders "No content" if content is empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <NoteCard note={{ ...mockNote, content: '' }} onEdit={onEditMock} onDelete={onDeleteMock} />
      </ThemeProvider>
    );
    expect(screen.getByText('No content')).toBeInTheDocument();
  });
  
  it('renders "Untitled Note" if title is empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <NoteCard note={{ ...mockNote, title: '' }} onEdit={onEditMock} onDelete={onDeleteMock} />
      </ThemeProvider>
    );
    expect(screen.getByText('Untitled Note')).toBeInTheDocument();
  });


  it('renders formatted updatedAt date', () => {
    renderNoteCard();
    const formattedDate = format(new Date(mockNote.updatedAt), 'PPpp');
    // Check if part of the formatted date string is present, as exact match can be tricky with timezones/locales
    expect(screen.getByText(`Last updated: ${formattedDate}`)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    renderNoteCard();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when Delete button is clicked', () => {
    renderNoteCard();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(mockNote.id);
  });
});
