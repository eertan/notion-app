const request = require('supertest');
const app = require('../server'); // Express app
const { query } = require('../db'); // Mocked DB
const { generateToken } = require('../utils/jwt'); // Used to create a real token

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn(),
}));

// Mock authMiddleware
let mockUserId = 1; // Default mock user ID for tasks
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: mockUserId };
    next();
  },
}));

describe('Tasks API', () => {
  let userToken;

  beforeAll(() => {
    userToken = generateToken(mockUserId.toString());
  });

  beforeEach(() => {
    query.mockClear();
    // Default mock for successful queries unless specified otherwise
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  // Test Suite for GET /api/tasks
  describe('GET /api/tasks', () => {
    it('should fetch all tasks for the authenticated user', async () => {
      const mockTasks = [
        { id: 1, user_id: mockUserId, title: 'Task 1', description: 'Desc 1', due_date: null, completed: false },
        { id: 2, user_id: mockUserId, title: 'Task 2', description: 'Desc 2', due_date: new Date().toISOString(), completed: true },
      ];
      query.mockResolvedValueOnce({ rows: mockTasks, rowCount: mockTasks.length });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY updated_at DESC',
        [mockUserId]
      );
    });
  });

  // Test Suite for POST /api/tasks
  describe('POST /api/tasks', () => {
    it('should create a new task for the authenticated user', async () => {
      const newTaskData = { title: 'New Task', description: 'Task Description', dueDate: new Date().toISOString().split('T')[0] };
      const mockCreatedTask = { 
        id: 3, 
        user_id: mockUserId, 
        title: newTaskData.title, 
        description: newTaskData.description, 
        due_date: newTaskData.dueDate, 
        completed: false, 
        created_at: new Date(), 
        updated_at: new Date() 
      };
      query.mockResolvedValueOnce({ rows: [mockCreatedTask], rowCount: 1 });

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTaskData);

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(newTaskData.title);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
        [mockUserId, newTaskData.title, newTaskData.description, newTaskData.dueDate]
      );
    });

    it('should create a task with null due date if not provided', async () => {
        const newTaskData = { title: 'Task with no due date', description: 'Description' };
        const mockCreatedTask = { id: 4, user_id: mockUserId, ...newTaskData, due_date: null, completed: false };
        query.mockResolvedValueOnce({ rows: [mockCreatedTask], rowCount: 1 });

        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newTaskData);
        
        expect(response.statusCode).toBe(201);
        expect(response.body.due_date).toBeNull();
        expect(query).toHaveBeenCalledWith(
            expect.any(String), // SQL string
            expect.arrayContaining([mockUserId, newTaskData.title, newTaskData.description, null])
        );
    });

    it('should return 400 if title is not provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'Some description' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Title is required');
    });
  });

  // Test Suite for PUT /api/tasks/:id
  describe('PUT /api/tasks/:id', () => {
    const taskIdToUpdate = 1;
    const updatedTaskData = { title: 'Updated Task Title', completed: true };

    it('should update an existing task for the authenticated user', async () => {
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId }], rowCount: 1 }); // Task check
      const mockUpdatedDbTask = { id: taskIdToUpdate, user_id: mockUserId, ...updatedTaskData, updated_at: new Date() };
      query.mockResolvedValueOnce({ rows: [mockUpdatedDbTask], rowCount: 1 }); // Update query

      const response = await request(app)
        .put(`/api/tasks/${taskIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedTaskData);

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe(updatedTaskData.title);
      expect(response.body.completed).toBe(updatedTaskData.completed);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query.mock.calls[1][0]).toContain('UPDATE tasks SET');
    });

    it('should return 404 if task not found for update', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Task check fails

      const response = await request(app)
        .put(`/api/tasks/999`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedTaskData);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });
    
    it('should return 400 if no valid fields are provided for update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({}); // Empty body

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Please provide at least one field to update (title, description, dueDate, completed)');
    });
  });

  // Test Suite for DELETE /api/tasks/:id
  describe('DELETE /api/tasks/:id', () => {
    const taskIdToDelete = 1;

    it('should delete an existing task for the authenticated user', async () => {
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId }], rowCount: 1 }); // Task check
      query.mockResolvedValueOnce({ rows: [{id: taskIdToDelete}], rowCount: 1 }); // Delete query

      const response = await request(app)
        .delete(`/api/tasks/${taskIdToDelete}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
      expect(query).toHaveBeenCalledTimes(2);
      expect(query.mock.calls[1][0]).toEqual('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id');
    });

    it('should return 404 if task not found for deletion', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Task check fails

      const response = await request(app)
        .delete(`/api/tasks/999`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});
