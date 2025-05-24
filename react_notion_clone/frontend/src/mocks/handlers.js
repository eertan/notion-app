import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { username } = await request.json();
    if (username === 'testuser') {
      return HttpResponse.json({ 
        token: 'fake-jwt-token', 
        user: { id: '1', username: 'testuser', created_at: new Date().toISOString() } 
      });
    } else if (username === 'baduser') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { username } = await request.json();
    if (username === 'newuser') {
      return HttpResponse.json({ 
        token: 'new-fake-jwt-token', 
        user: { id: '2', username: 'newuser', created_at: new Date().toISOString() } 
      }, { status: 201 });
    } else if (username === 'existinguser') {
      return HttpResponse.json({ message: 'User already exists' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }),

  // Notes Handlers
  http.get(`${API_URL}/notes`, ({ request }) => {
    // Check for auth token presence (simple check)
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return HttpResponse.json({ message: 'Not authorized' }, { status: 401 });
    }
    return HttpResponse.json([
      { id: 'n1', userId: '1', title: 'Mock Note 1', content: 'Content 1', updatedAt: new Date().toISOString() },
      { id: 'n2', userId: '1', title: 'Mock Note 2', content: 'Content 2', updatedAt: new Date().toISOString() },
    ]);
  }),
  
  http.post(`${API_URL}/notes`, async ({ request }) => {
    const { title, content } = await request.json();
    return HttpResponse.json({ 
        id: `n${Math.floor(Math.random()*1000)}`, 
        userId: '1', // Assuming user '1' is authenticated
        title, 
        content, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
    }, { status: 201 });
  }),

  // Tasks Handlers (add more as needed)
  http.get(`${API_URL}/tasks`, ({ request }) => {
     const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return HttpResponse.json({ message: 'Not authorized' }, { status: 401 });
    }
    return HttpResponse.json([
      { id: 't1', userId: '1', title: 'Mock Task 1', description: '', dueDate: null, completed: false },
    ]);
  }),
];
