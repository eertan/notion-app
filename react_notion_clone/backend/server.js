const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Basic route
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Notes routes
const notesRoutes = require('./routes/notes');
app.use('/api/notes', notesRoutes);

// Tasks routes
const tasksRoutes = require('./routes/tasks');
app.use('/api/tasks', tasksRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app; // For potential testing
