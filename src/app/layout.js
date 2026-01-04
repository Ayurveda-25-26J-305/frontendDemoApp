'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Ayurvedic AI Healthcare System</title>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}