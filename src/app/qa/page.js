'use client';
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { Help } from '@mui/icons-material';

export default function QAPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: '60vh' }}>
        <Help sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Q&A System
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Developed by Fernando K P M R A (IT22897176)
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            This module will provide intelligent question-answering capabilities
            trained on classical Ayurvedic texts for instant health guidance.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 4 }} color="text.secondary">
          🚧 Component integration in progress
        </Typography>
      </Paper>
    </Container>
  );
}