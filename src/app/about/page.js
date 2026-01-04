'use client';
import React from 'react';
import { Container, Typography, Paper, Grid, Box, Chip } from '@mui/material';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Perera S I A',
      id: 'IT22905918',
      component: 'Disease Prediction',
      description: 'Constitutional-aware ML disease prediction (84.2% accuracy)',
    },
    {
      name: 'Roche J P',
      id: 'IT22344274',
      component: 'Medicine Recommendation',
      description: 'Context-aware Ayurvedic medicine suggestions',
    },
    {
      name: 'Dias W A N M',
      id: 'IT22899910',
      component: 'Diet Planning',
      description: 'Personalized Ayurvedic meal planning',
    },
    {
      name: 'Fernando K P M R A',
      id: 'IT22897176',
      component: 'Q&A System',
      description: 'Intelligent health question-answering',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom textAlign="center">
        About the System
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph textAlign="center" sx={{ mb: 6 }}>
        Smart Ayurvedic Disease Prediction and Recommendation System
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Project Overview
        </Typography>
        <Typography paragraph>
          This integrated AI-powered platform combines traditional Ayurvedic principles
          with modern machine learning for personalized healthcare. The system consists
          of four interconnected modules working together to provide comprehensive
          Ayurvedic healthcare guidance.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Chip label="AI-Powered" color="primary" />
          <Chip label="84.2% Accuracy" color="success" />
          <Chip label="Constitutional-Aware" color="primary" />
          <Chip label="4 Integrated Modules" color="secondary" />
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Development Team
      </Typography>

      <Grid container spacing={3}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {member.component}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {member.id}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {member.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mt: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Academic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2">
              <strong>Institution:</strong> SLIIT - Sri Lanka Institute of Information Technology
            </Typography>
            <Typography variant="body2">
              <strong>Research Group:</strong> Centre of Excellence for AI (CoEAI)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2">
              <strong>Course:</strong> IT4010 Research Project - 2025 July
            </Typography>
            <Typography variant="body2">
              <strong>Project ID:</strong> 25-26J-305
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}