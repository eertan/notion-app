import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { format } from 'date-fns'; // Using date-fns for formatting, ensure it's installed or use native Date methods

const NoteCard = ({ note, onEdit, onDelete }) => {
  const { title, content, updatedAt } = note;

  const formattedDate = updatedAt ? format(new Date(updatedAt), 'PPpp') : 'N/A';
  // PPpp format: "Sep 14, 2023, 2:51:30 PM" - choose a format that suits you

  const contentSnippet = content ? (content.substring(0, 100) + (content.length > 100 ? '...' : '')) : '';

  return (
    <Card sx={{ mb: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {title || 'Untitled Note'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Last updated: {formattedDate}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {contentSnippet || 'No content'}
        </Typography>
      </CardContent>
      <CardActions sx={{ mt: 'auto' }}>
        <Button size="small" onClick={() => onEdit(note)}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(note.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default NoteCard;
