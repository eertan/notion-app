import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Registers a new user.
 * @param {object} userData - { username, password }
 * @returns {Promise<object>} The response data from the server.
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Fetches all tasks for the authenticated user.
 * @returns {Promise<Array>} A list of tasks.
 */
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch tasks' };
  }
};

/**
 * Creates a new task.
 * @param {object} taskData - { title, description, dueDate }
 * @returns {Promise<object>} The created task.
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create task' };
  }
};

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} taskData - { title, description, dueDate, completed }
 * @returns {Promise<object>} The updated task.
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update task' };
  }
};

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<object>} Confirmation message or empty response.
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data; // Or handle 204 No Content if backend returns that
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete task' };
  }
};

/**
 * Logs in an existing user.
 * @param {object} userData - { username, password }
 * @returns {Promise<object>} The response data from the server.
 */
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// You can add other API functions here for notes, tasks, etc.
// For example:
// export const getNotes = async () => api.get('/notes');
// export const createNote = async (noteData) => api.post('/notes', noteData);

/**
 * Fetches all notes for the authenticated user.
 * @returns {Promise<Array>} A list of notes.
 */
export const getNotes = async () => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notes' };
  }
};

/**
 * Creates a new note.
 * @param {object} noteData - { title, content }
 * @returns {Promise<object>} The created note.
 */
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create note' };
  }
};

/**
 * Updates an existing note.
 * @param {string} noteId - The ID of the note to update.
 * @param {object} noteData - { title, content }
 * @returns {Promise<object>} The updated note.
 */
export const updateNote = async (noteId, noteData) => {
  try {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update note' };
  }
};

/**
 * Deletes a note.
 * @param {string} noteId - The ID of the note to delete.
 * @returns {Promise<object>} Confirmation message or empty response.
 */
export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data; // Or handle 204 No Content if backend returns that
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete note' };
  }
};

export default api;
