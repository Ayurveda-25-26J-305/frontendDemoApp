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
  TableRow,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  Restaurant,
  LocalDining,
  Favorite,
  Spa,
  Insights
} from '@mui/icons-material';

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
      <Paper elevation={6} sx={{ p: 5, borderRadius: 4 }}>
        {/* HEADER */}
        <Box textAlign="center" mb={4}>
          <Restaurant sx={{ fontSize: 90, color: 'primary.main' }} />
          <Typography variant="h3" gutterBottom>
            Personalized Ayurvedic Meal Planner
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-assisted dietary guidance based on Ayurvedic principles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Developed by Dias W A N M (IT22899910)
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        
        {/* FORM */}
<Box component="form" onSubmit={handleSubmit}>
  <Grid container spacing={4}>

    {/* Personal Details */}
    <Grid item xs={12}>
      <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#e8f5e9', '&:hover': { boxShadow: 10 } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧍 Personal Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="ageCategory"
                label="Age"
                helperText="Enter Age Category"
                onChange={handleChange}
                required
              >
                <MenuItem value="child">Child</MenuItem>
                <MenuItem value="adult">Adult</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="gender"
                label="Gender"
                helperText="Enter Gender"
                onChange={handleChange}
                required
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* Health Information */}
    <Grid item xs={12}>
      <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#e3f2fd', '&:hover': { boxShadow: 10 } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🩺 Health Information
          </Typography>

          <TextField
            fullWidth
            name="disease"
            label="Disease"
            placeholder="e.g. Diabetes"
            helperText="Used to personalize Ayurvedic recommendations"
            onChange={handleChange}
            required
          />
        </CardContent>
      </Card>
    </Grid>

    {/* Diet Preferences */}
    <Grid item xs={12}>
      <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#fff3e0', '&:hover': { boxShadow: 10 } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🍽️ Diet Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                name="mealCategory"
                label="Meal"
                helperText="Enter Meal"
                onChange={handleChange}
                required
              >
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                name="foodPreference"
                label="Food Preference"
                helperText="Enter Preference"
                onChange={handleChange}
                required
              >
                <MenuItem value="veg">Vegetarian</MenuItem>
                <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                name="activityLevel"
                label="Activity"
                helperText="Enter Level"
                onChange={handleChange}
                required
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* Submit */}
    <Grid item xs={12}>
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        startIcon={<Insights />}
        sx={{
          py: 1.6,
          borderRadius: 3,
          fontSize: '1.05rem'
        }}
      >
        Generate Meal Plan
      </Button>
    </Grid>

  </Grid>
</Box>


        {/* RESULTS */}
        {result && (
          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              🌿 Personalized Results
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card elevation={4}>
                  <CardContent>
                    <Spa color="primary" />
                    <Typography variant="h6">Dominant Dosha</Typography>
                    <Typography variant="h4" color="primary">
                      {result.dosha}
                    </Typography>
                    <Chip label="AI Verified" color="success" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card elevation={4}>
                  <CardContent>
                    <LocalDining color="primary" />
                    <Typography variant="h6" gutterBottom>
                      Recommended Meal
                    </Typography>
                    {result.recommendedMeal.map((item, i) => (
                      <Chip key={i} label={item} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card elevation={4} sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ayurvedic Taste Balance (Shad Rasa)
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Taste</strong></TableCell>
                      <TableCell><strong>Sanskrit</strong></TableCell>
                      <TableCell><strong>Dishes</strong></TableCell>
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
              </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="h6">Nutrient Summary</Typography>
                    <Typography>Calories: {result.nutrients.calories} kcal</Typography>
                    <Typography>Protein: {result.nutrients.protein} g</Typography>
                    <Typography>Carbs: {result.nutrients.carbs} g</Typography>
                    <Typography>Fat: {result.nutrients.fat} g</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={4}>
                  <CardContent>
                    <Favorite color="error" />
                    <Typography variant="h6">Foods to Avoid</Typography>
                    {result.foodsToAvoid.map((food, i) => (
                      <Chip key={i} label={food} color="warning" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </CardContent>
                </Card>
              </Grid>

                  {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Insights />}
                  sx={{
                    py: 1.6,
                    borderRadius: 3,
                    fontSize: '1.05rem'
                  }}
                >
                  Generate Monthly Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
