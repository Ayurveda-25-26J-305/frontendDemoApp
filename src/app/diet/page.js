'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';

export default function DietPage() {
  const [formData, setFormData] = useState({
    ageCategory: '',
    gender: '',
    disease: '',
    mealCategory: '',
    foodPreference: '',
    activityLevel: ''
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mockResult = {
      dosha: 'Pitta',
      recommendedMeal: [
        'Red rice',
        'Moong dal curry',
        'Pumpkin curry',
        'Cucumber salad'
      ],
      nutrients: {
        calories: 520,
        protein: 18,
        carbs: 92,
        fat: 18
      },
      foodsToAvoid: ['Fried foods', 'Spicy curries', 'Sugary desserts'],
      ayurvedicTastes: [
        { taste: 'Sweet', sanskrit: 'Madhura', dishes: 'Red rice, Pumpkin curry, Moong dal curry, Cucumber' },
        { taste: 'Astringent', sanskrit: 'Kashaya', dishes: 'Moong dal curry, Cucumber salad' },
        { taste: 'Bitter', sanskrit: 'Tikta', dishes: 'Cucumber (mild)' },
        { taste: 'Salty', sanskrit: 'Lavana', dishes: 'Salt used in curries and salad' },
        { taste: 'Pungent', sanskrit: 'Katu', dishes: 'Ginger, pepper, mustard seeds, chilli' },
        { taste: 'Sour', sanskrit: 'Amla', dishes: 'Tamarind or lime (if used)' }
      ]
    };

    setResult(mockResult);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Restaurant sx={{ fontSize: 90, color: 'primary.main', mb: 2 }} />

        <Typography variant="h3" gutterBottom>
          Personalized Ayurvedic Meal Planner
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph>
          Developed by Dias W A N M (IT22899910)
        </Typography>

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth name="ageCategory" label="Age Category" onChange={handleChange} required>
                <MenuItem value="child">Child</MenuItem>
                <MenuItem value="adult">Adult</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth name="gender" label="Gender" onChange={handleChange} required>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="disease"
                label="Disease"
                placeholder="e.g. Diabetes"
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="mealCategory" label="Meal Category" onChange={handleChange} required>
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="foodPreference" label="Food Preference" onChange={handleChange} required>
                <MenuItem value="veg">Vegetarian</MenuItem>
                <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="activityLevel" label="Activity Level" onChange={handleChange} required>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" fullWidth>
                Generate Meal Plan
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* RESULTS */}
        {result && (
          <Box sx={{ mt: 6, textAlign: 'left' }}>
            <Typography variant="h5" gutterBottom>
              Dominant Dosha: <strong>{result.dosha}</strong>
            </Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Recommended Meal
            </Typography>
            <ul>
              {result.recommendedMeal.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Ayurvedic Taste Balance (Shad Rasa)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This meal is balanced across all six Ayurvedic tastes
            </Typography>

            <Table sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Taste</strong></TableCell>
                  <TableCell><strong>Sanskrit</strong></TableCell>
                  <TableCell><strong>Dishes Contributing</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.ayurvedicTastes.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell>{t.taste}</TableCell>
                    <TableCell><em>{t.sanskrit}</em></TableCell>
                    <TableCell>{t.dishes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Nutrient Summary
            </Typography>
            <Typography>Calories: {result.nutrients.calories} kcal</Typography>
            <Typography>Protein: {result.nutrients.protein} g</Typography>
            <Typography>Carbohydrates: {result.nutrients.carbs} g</Typography>
            <Typography>Fat: {result.nutrients.fat} g</Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Foods to Avoid
            </Typography>
            <ul>
              {result.foodsToAvoid.map((food, i) => (
                <li key={i}>{food}</li>
              ))}
            </ul>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
