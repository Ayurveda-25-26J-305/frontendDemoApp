'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  LocalHospital,
  Medication,
  Restaurant,
  Help,
  TrendingUp,
  Spa,
  Psychology,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function HomePage() {
  const features = [
    {
      title: 'Disease Prediction',
      description: 'AI-powered disease prediction using constitutional-aware machine learning. Integrates Prakriti assessment with symptoms for personalized diagnosis.',
      icon: <LocalHospital sx={{ fontSize: 50 }} />,
      path: '/prediction',
      color: '#2d5016',
      stats: { accuracy: '84.2%', improvement: '+10%' },
      developer: 'Perera S I A',
      id: 'IT22905918',
    },
    {
      title: 'Medicine Recommendation',
      description: 'Context-aware Ayurvedic medicine suggestions based on predicted disease, dosha type, and individual constitution.',
      icon: <Medication sx={{ fontSize: 50 }} />,
      path: '/medicine',
      color: '#4a7c2c',
      developer: 'Roche J P',
      id: 'IT22344274',
    },
    {
      title: 'Diet Planning',
      description: 'Personalized Ayurvedic meal plans considering disease, dosha balance, season, and individual preferences.',
      icon: <Restaurant sx={{ fontSize: 50 }} />,
      path: '/diet',
      color: '#6a8759',
      developer: 'Dias W A N M',
      id: 'IT22899910',
    },
    {
      title: 'Q&A System',
      description: 'Intelligent question-answering system trained on classical Ayurvedic texts for instant health guidance.',
      icon: <Help sx={{ fontSize: 50 }} />,
      path: '/qa',
      color: '#558b2f',
      developer: 'Fernando K P M R A',
      id: 'IT22897176',
    },
  ];

  const systemStats = [
    { label: 'Diseases Covered', value: '5+', icon: <LocalHospital /> },
    { label: 'Prediction Accuracy', value: '84.2%', icon: <TrendingUp /> },
    { label: 'Classical References', value: '100+', icon: <Spa /> },
    { label: 'AI Models', value: '4', icon: <Psychology /> },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'white',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  🌿 Ayurvedic AI Healthcare System
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    color: '#c8e6c9',
                    fontWeight: 400,
                  }}
                >
                  Bridging Ancient Wisdom with Modern Artificial Intelligence
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: '1.1rem',
                    color: '#e8f5e9',
                    lineHeight: 1.8,
                  }}
                >
                  An integrated platform combining traditional Ayurvedic principles with 
                  cutting-edge machine learning for personalized disease prediction, 
                  medicine recommendations, diet planning, and intelligent health guidance.
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
                    href="/prediction"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Start Prediction
                  </Button>
                  <Button
                    component={Link}
                    href="/about"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>

                {/* Quick Stats */}
                <Box sx={{ display: 'flex', gap: 3, mt: 4, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckCircle />}
                    label="84.2% Accuracy"
                    sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label="10% Improvement"
                    sx={{ bgcolor: '#8bc34a', color: 'white', fontWeight: 600 }}
                  />
                  <Chip
                    label="Constitutional-Aware"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                  />
                </Box>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={5}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Spa sx={{ fontSize: 300, opacity: 0.2 }} />
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* System Stats */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {systemStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  textAlign: 'center',
                  py: 3,
                  background: 'white',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            System Components
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Four integrated modules for comprehensive Ayurvedic healthcare
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s',
                  borderTop: `4px solid ${feature.color}`,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: feature.color, mr: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>

                  {feature.stats && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip
                        label={`Accuracy: ${feature.stats.accuracy}`}
                        size="small"
                        sx={{ bgcolor: '#e8f5e9' }}
                      />
                      <Chip
                        label={`Improvement: ${feature.stats.improvement}`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  )}

                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary">
                      Developed by
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {feature.developer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feature.id}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    href={feature.path}
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: feature.color,
                      '&:hover': {
                        bgcolor: feature.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Explore Module
                  </Button>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Simple 4-step process for personalized Ayurvedic care
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Prakriti Assessment',
                description: 'Complete a quick constitutional assessment to determine your unique Vata-Pitta-Kapha balance',
                icon: <Psychology />,
              },
              {
                step: '02',
                title: 'Symptom Analysis',
                description: 'Describe your symptoms and health concerns in detail for accurate AI analysis',
                icon: <LocalHospital />,
              },
              {
                step: '03',
                title: 'AI Prediction',
                description: 'Our constitutional-aware ML model predicts diseases with 84.2% accuracy',
                icon: <TrendingUp />,
              },
              {
                step: '04',
                title: 'Personalized Plan',
                description: 'Receive customized medicine recommendations, diet plans, and health guidance',
                icon: <CheckCircle />,
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography
                    variant="h3"
                    sx={{ color: 'primary.light', fontWeight: 700, mb: 1 }}
                  >
                    {item.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
            color: 'white',
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#c8e6c9' }}>
            Experience the power of AI-driven Ayurvedic healthcare
          </Typography>
          <Button
            component={Link}
            href="/prediction"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s',
            }}
          >
            Start Your Health Journey
          </Button>
        </Paper>
      </Container>

      {/* Research Attribution */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Paper sx={{ p: 4, bgcolor: '#f5f5f5' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            Academic Research Project
          </Typography>
          <Grid container spacing={3} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Institution:</strong> Sri Lanka Institute of Information Technology (SLIIT)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Research Group:</strong> Centre of Excellence for AI (CoEAI)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Course:</strong> IT4010 Research Project - 2025 July Batch
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Project ID:</strong> 25-26J-305
              </Typography>
            </Grid>
          </Grid>
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'error.main' }}
          >
            ⚠️ For educational and research purposes only. Always consult qualified healthcare practitioners.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}