import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css'; // Global styles
import { ThemeProvider, createTheme } from '@mui/material/styles'; // MUI Theme
import CssBaseline from '@mui/material/CssBaseline'; // MUI CSS Baseline

// A basic MUI theme (can be customized further)
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // Example primary color
    },
    secondary: {
      main: '#19857b', // Example secondary color
    },
    background: {
      default: '#f4f6f8', // Main background color for the app
    },
    paper: { // Default background for Paper and Card components
      default: '#ffffff',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Consistent border radius for components like Card, Button, Paper
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More modern look for buttons
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 1, // Subtle shadow for cards
      },
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', // Slightly more pronounced shadow on hover
          }
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1, // Subtle shadow for paper components
      }
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 8, // Ensure dialogs also use the theme's border radius
            }
        }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS and apply background from theme */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
