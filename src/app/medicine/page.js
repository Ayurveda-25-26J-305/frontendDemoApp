'use client';
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { Medication } from '@mui/icons-material';

export default function MedicinePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: '60vh' }}>
        <Medication sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Medicine Recommendation Module
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Developed by Roche J P (IT22344274)
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            This module will provide context-aware Ayurvedic medicine recommendations
            based on predicted disease, dosha type, and individual constitution.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 4 }} color="text.secondary">
          🚧 Component integration in progress
        </Typography>
      </Paper>
    </Container>
  );
}