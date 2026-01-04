'use client';
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

export default function DietPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: '60vh' }}>
        <Restaurant sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Diet Planning Module
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Developed by Dias W A N M (IT22899910)
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            This module will provide personalized Ayurvedic meal plans considering
            disease, dosha balance, season, and individual preferences.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 4 }} color="text.secondary">
          🚧 Component integration in progress
        </Typography>
      </Paper>
    </Container>
  );
}