'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2d5016', light: '#4a7c2c', dark: '#1a3009' },
    secondary: { main: '#6a8759', light: '#8fa97f', dark: '#4d6140' },
    success: { main: '#4caf50' },
    background: { default: '#f1f8e9', paper: '#ffffff' },
    text: { primary: '#1b5e20', secondary: '#33691e' },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: { fontWeight: 700, color: '#2d5016' },
    h2: { fontWeight: 700, color: '#2d5016' },
    h3: { fontWeight: 600, color: '#2d5016' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
      },
    },
  },
});