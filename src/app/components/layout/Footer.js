'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import { Spa } from '@mui/icons-material';
import Link from 'next/link';

export default function Footer() {
  const teamMembers = [
    { name: 'Perera S I A', id: 'IT22905918', component: 'Disease Prediction' },
    { name: 'Roche J P', id: 'IT22344274', component: 'Medicine Recommendation' },
    { name: 'Dias W A N M', id: 'IT22899910', component: 'Diet Planning' },
    { name: 'Fernando K P M R A', id: 'IT22897176', component: 'Q&A System' },
  ];

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Disease Prediction', path: '/prediction' },
    { label: 'Medicine Recommendation', path: '/medicine' },
    { label: 'Diet Planning', path: '/diet' },
    { label: 'Q&A System', path: '/qa' },
    { label: 'About', path: '/about' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #2d5016 0%, #1a3009 100%)',
        color: 'white',
        py: 6,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Spa sx={{ fontSize: 40, mr: 1 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Ayurvedic AI
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9' }}>
                  Healthcare System
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#c8e6c9', mb: 2, lineHeight: 1.7 }}>
              An integrated AI-powered platform combining traditional Ayurvedic principles 
              with modern machine learning for personalized healthcare.
            </Typography>
            <Typography variant="caption" sx={{ color: '#a5d6a7', display: 'block' }}>
              SLIIT - Centre of Excellence for AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#a5d6a7', display: 'block' }}>
              Project ID: 25-26J-305
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link) => (
                <Link 
                  key={link.path}
                  href={link.path} 
                  style={{ textDecoration: 'none' }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#c8e6c9',
                      '&:hover': { 
                        color: 'white',
                        textDecoration: 'underline',
                      },
                      cursor: 'pointer',
                    }}
                  >
                    → {link.label}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Team Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Development Team
            </Typography>
            {teamMembers.map((member, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9' }}>
                  {member.id} • {member.component}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#a5d6a7' }}>
            © 2025 Ayurvedic AI Healthcare System. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: '#a5d6a7' }}>
            Research Project - SLIIT
          </Typography>
        </Box>

        {/* Disclaimer */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: '#ffcc80', display: 'block', textAlign: 'center' }}>
            ⚠️ For educational and research purposes only. Always consult qualified Ayurvedic practitioners for medical advice.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}