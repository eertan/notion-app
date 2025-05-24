const request = require('supertest');
const app = require('../server'); // Express app
const { query } = require('../db'); // Mocked DB
const { generateToken } = require('../utils/jwt'); // Used to create a real token for testing

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn(),
}));

// Mock authMiddleware - simpler than mocking JWT verification for now
// This mock will make sure req.user is set for protected routes
let mockUserId = 1; // Default mock user ID
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: mockUserId }; // Attach a mock user ID
    next();
  },
}));


describe('Notes API', () => {
  let userToken;

  beforeAll(() => {
    // Generate a token for a test user.
    // In a real scenario with complex auth, you might log in a test user.
    // Here, since authMiddleware is broadly mocked, this token is mostly for show
    // but good practice if the middleware mock was more granular.
    userToken = generateToken(mockUserId.toString()); 
  });

  beforeEach(() => {
    query.mockClear();
    // Default mock for successful queries unless specified otherwise in a test
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  // Test Suite for GET /api/notes
  describe('GET /api/notes', () => {
    it('should fetch all notes for the authenticated user', async () => {
      const mockNotes = [
        { id: 1, user_id: mockUserId, title: 'Note 1', content: 'Content 1', created_at: new Date(), updated_at: new Date() },
        { id: 2, user_id: mockUserId, title: 'Note 2', content: 'Content 2', created_at: new Date(), updated_at: new Date() },
      ];
      query.mockResolvedValueOnce({ rows: mockNotes, rowCount: mockNotes.length });

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockNotes);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
        [mockUserId]
      );
    });
  });

  // Test Suite for POST /api/notes
  describe('POST /api/notes', () => {
    it('should create a new note for the authenticated user', async () => {
      const newNoteData = { title: 'New Note', content: 'New Content' };
      const mockCreatedNote = { id: 3, user_id: mockUserId, ...newNoteData, created_at: new Date(), updated_at: new Date() };
      query.mockResolvedValueOnce({ rows: [mockCreatedNote], rowCount: 1 });

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newNoteData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(mockCreatedNote);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
        [mockUserId, newNoteData.title, newNoteData.content]
      );
    });

    it('should return 400 if title is not provided', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Some content without title' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Title is required');
    });
  });

  // Test Suite for PUT /api/notes/:id
  describe('PUT /api/notes/:id', () => {
    const noteIdToUpdate = 1;
    const updatedNoteData = { title: 'Updated Title', content: 'Updated Content' };

    it('should update an existing note for the authenticated user', async () => {
      // Mock for the initial check of the note
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId }], rowCount: 1 });
      // Mock for the actual update query
      const mockUpdatedDbNote = { id: noteIdToUpdate, user_id: mockUserId, ...updatedNoteData, updated_at: new Date() };
      query.mockResolvedValueOnce({ rows: [mockUpdatedDbNote], rowCount: 1 });
      
      const response = await request(app)
        .put(`/api/notes/${noteIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedNoteData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockUpdatedDbNote);
      expect(query).toHaveBeenCalledTimes(2); // Check + Update
       // More specific check for the update query (tricker due to dynamic fields)
      expect(query.mock.calls[1][0]).toContain('UPDATE notes SET');
      expect(query.mock.calls[1][1]).toEqual(expect.arrayContaining([updatedNoteData.title, updatedNoteData.content, noteIdToUpdate, mockUserId]));
    });

    it('should return 404 if note not found', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Note check fails

      const response = await request(app)
        .put(`/api/notes/999`) // Non-existent ID
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedNoteData);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Note not found');
    });

    it('should return 403 if user tries to update another user\'s note', async () => {
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId + 1 }], rowCount: 1 }); // Note belongs to another user

      const response = await request(app)
        .put(`/api/notes/${noteIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedNoteData);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('User not authorized to update this note');
    });
     it('should return 400 if neither title nor content is provided for update', async () => {
      const response = await request(app)
        .put(`/api/notes/${noteIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Please provide title or content to update');
    });
  });

  // Test Suite for DELETE /api/notes/:id
  describe('DELETE /api/notes/:id', () => {
    const noteIdToDelete = 1;

    it('should delete an existing note for the authenticated user', async () => {
      // Mock for the initial check (optional, but good for consistency with route logic)
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId }], rowCount: 1 });
      // Mock for the delete query
      query.mockResolvedValueOnce({ rows: [{id: noteIdToDelete}], rowCount: 1 }); // Simulating RETURNING id

      const response = await request(app)
        .delete(`/api/notes/${noteIdToDelete}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Note deleted successfully');
      expect(query).toHaveBeenCalledTimes(2); // Check + Delete
      expect(query.mock.calls[1][0]).toEqual('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id');
      expect(query.mock.calls[1][1]).toEqual([noteIdToDelete, mockUserId]);
    });

    it('should return 404 if note not found for deletion', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Note check fails

      const response = await request(app)
        .delete(`/api/notes/999`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Note not found');
    });

    it('should return 403 if user tries to delete another user\'s note', async () => {
      query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId + 1 }], rowCount: 1 }); // Note belongs to another user

      const response = await request(app)
        .delete(`/api/notes/${noteIdToDelete}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('User not authorized to delete this note');
    });
  });
});
