import React from 'react';
import { Routes, Route, Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AppBar, Toolbar, Typography, Button, Box, Container, CircularProgress } from '@mui/material';

// Placeholder Pages (Create these files in src/pages/)
const HomePage = () => (
  <Container>
    <Typography variant="h4" sx={{ mt: 4 }}>Home Page</Typography>
    <Typography sx={{ mt: 2 }}>Welcome to your dashboard!</Typography>
  </Container>
);

// Placeholder NotesPage removed, will be imported
// const NotesPage = () => (
//   <Container>
//     <Typography variant="h4" sx={{ mt: 4 }}>Notes Page</Typography>
//     <Typography sx={{ mt: 2 }}>Manage your notes here.</Typography>
//   </Container>
// );
import NotesPage from './pages/NotesPage'; // Import the actual NotesPage
import TasksPage from './pages/TasksPage'; // Import the actual TasksPage


function App() {
  const { isAuthenticated, logout, isLoading, user } = useAuth();

  if (isLoading) { // This top-level isLoading check might be redundant if ProtectedRoute handles it
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Notion Clone
          </Typography>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/">Home</Button>
              <Button color="inherit" component={RouterLink} to="/notes">Notes</Button>
              <Button color="inherit" component={RouterLink} to="/tasks">Tasks</Button>
              <Typography sx={{ mx: 2 }}>Welcome, {user?.username || 'User'}!</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        
        {/* Fallback for unmatched routes (optional) */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;
