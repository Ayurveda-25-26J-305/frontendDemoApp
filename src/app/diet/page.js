'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Papa from 'papaparse';

import {
  Container,
  Alert,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';

import {
  Restaurant,
  LocalDining,
  Favorite,
  Spa,
  Insights,
  Person,
  MonitorWeight,
  Height,
  HealthAndSafety,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';

export default function DietPage() {
  // -----------------------------
  // 1) Wizard steps
  // -----------------------------
  const steps = [
    'Personal & Measurements',
    'Health Information',
    'Meal Preferences',
    'Review & Results'
  ];
  const [activeStep, setActiveStep] = useState(0);

  // Fixed input styling
  const fieldSx = {
    minWidth: 220,
    '& .MuiOutlinedInput-root': { height: 56 }
  };

  // -----------------------------
  // 2) Form state (user inputs)
  // -----------------------------
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    disease: '',
    mealCategory: '',
    foodPreference: ''
  });

  // -----------------------------
  // 3) Result state (STATIC for now)
  // -----------------------------
  const [result, setResult] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // -----------------------------
  // 4) Disease options
  // -----------------------------
  const diseaseOptions = useMemo(
    () => [
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'migraine', label: 'Migraine' },
      { value: 'arthritis', label: 'Arthritis' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'gastritis', label: 'Gastritis' }
    ],
    []
  );

  const getDiseaseLabel = (value) =>
    diseaseOptions.find((d) => d.value === value)?.label || value;

  // -----------------------------
  // 5) CSV Taste mapping (ayurvedic_food_tastes.csv)
  // Put this file in: /public/ayurvedic_food_tastes.csv
  // Columns: Food, Ayurvedic_Taste
  // -----------------------------
  const [tasteMap, setTasteMap] = useState(null);

  const ALL_RASAS = useMemo(
    () => ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent'],
    []
  );

  const rasaLabel = (key) => {
    const map = {
      sweet: 'Sweet (Madhura)',
      sour: 'Sour (Amla)',
      salty: 'Salty (Lavana)',
      pungent: 'Pungent (Katu)',
      bitter: 'Bitter (Tikta)',
      astringent: 'Astringent (Kashaya)'
    };
    return map[key] || key;
  };

  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

  const tasteToKey = (t) => {
    const x = String(t || '').toLowerCase();
    if (x.includes('sweet')) return 'sweet';
    if (x.includes('sour')) return 'sour';
    if (x.includes('salty')) return 'salty';
    if (x.includes('pungent')) return 'pungent';
    if (x.includes('bitter')) return 'bitter';
    if (x.includes('astringent')) return 'astringent';
    return 'astringent';
  };

  // Load CSV once
  useEffect(() => {
    fetch('/ayurvedic_food_tastes.csv')
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });

        const map = new Map();
        (parsed.data || []).forEach((row) => {
          const dish = norm(row?.Food);
          const rasaKey = tasteToKey(row?.Ayurvedic_Taste);
          if (dish) map.set(dish, rasaKey);
        });

        setTasteMap(map);
      })
      .catch((err) => {
        console.error('Failed to load tastes CSV:', err);
        setTasteMap(new Map()); // avoid crashing UI
      });
  }, []);

  // Group the generated dishes into 6 tastes
  const rasaGrouped = useMemo(() => {
    const grouped = {
      sweet: [],
      sour: [],
      salty: [],
      pungent: [],
      bitter: [],
      astringent: [],
      unknown: [] // for dishes not found in CSV
    };

    if (!result?.meal_plan) return grouped;

    (result.meal_plan || []).forEach((item) => {
      const dishName = item?.dish;
      const rasaKey = tasteMap?.get(norm(dishName));
      if (!tasteMap) grouped.unknown.push(item);
      else if (!rasaKey) grouped.unknown.push(item);
      else grouped[rasaKey].push(item);
    });

    return grouped;
  }, [tasteMap, result]);

  // -----------------------------
  // 6) Handle changes + validations
  // -----------------------------
  const handleChange = (e) => {
    setHasGenerated(false);
    setResult(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const stepValid = (step) => {
    if (step === 0)
      return (
        !!formData.age &&
        !!formData.gender &&
        !!formData.weight &&
        !!formData.height
      );
    if (step === 1) return !!formData.disease;
    if (step === 2) return !!formData.mealCategory && !!formData.foodPreference;
    return true;
  };

  // -----------------------------
  // 7) Generate (STATIC output for now)
  // -----------------------------
  const handleGenerate = (e) => {
    if (e?.preventDefault) e.preventDefault();

    const mockResult = {
      user_bmi: 22.04,
      predicted_bmi_category: 'normal',
      meal_category: formData.mealCategory,
      diet_preference: formData.foodPreference,
      disease: formData.disease,
      foods_to_avoid:
        'Caffeinated drinks, chocolate, aged/strong cheese, highly processed foods',
      meal_plan: [
        { dish: 'Soya roti', portion_pct: 28.4 },
        { dish: 'Chilli paneer', portion_pct: 48.23 },
        { dish: 'Russian salad', portion_pct: 16.23 },
        { dish: 'Bottle gourd soup (Ghiya/Lauki soup)', portion_pct: 7.15 }
      ],
      totals: {
        calories_kcal: 806.08,
        protein_g: 11.93,
        carbs_g: 50.86,
        fats_g: 61.29
      }
    };

    setResult(mockResult);
    setHasGenerated(true);
  };

  const handleNext = () => {
    if (!stepValid(activeStep)) return;

    // Auto-generate when moving from Meal Preferences -> Review
    if (activeStep === 2) {
      handleGenerate({ preventDefault: () => {} });
    }

    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => {
    setHasGenerated(false);
    setResult(null);
    setActiveStep((s) => Math.max(s - 1, 0));
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

        {/* STEPPER */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block', textAlign: 'center' }}
          >
            Fill step-by-step to generate a personalized meal plan.
          </Typography>
        </Box>

        {/* WIZARD CONTENT */}
        <Box component="form" onSubmit={handleGenerate}>
          <Grid container spacing={4}>
            {/* STEP 0: Personal */}
            {activeStep === 0 && (
              <Grid item xs={12}>
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: '#e8f5e9',
                    '&:hover': { boxShadow: 10 }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🧍 Personal & Measurements
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          name="age"
                          label="Age (years)"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: 1, max: 120 }}
                          onChange={handleChange}
                          value={formData.age}
                          required
                          sx={fieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          select
                          fullWidth
                          name="gender"
                          label="Gender"
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          value={formData.gender}
                          required
                          sx={fieldSx}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          name="weight"
                          label="Weight (kg)"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: 1, max: 250, step: 0.1 }}
                          onChange={handleChange}
                          value={formData.weight}
                          required
                          sx={fieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          name="height"
                          label="Height (cm)"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: 50, max: 250 }}
                          onChange={handleChange}
                          value={formData.height}
                          required
                          sx={fieldSx}
                        />
                      </Grid>
                    </Grid>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, display: 'block' }}
                    >
                      BMI will be calculated automatically after generating the meal plan.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* STEP 1: Health */}
            {activeStep === 1 && (
              <Grid item xs={12}>
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: '#e3f2fd',
                    '&:hover': { boxShadow: 10 }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🩺 Health Information
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          name="disease"
                          label="Disease"
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          value={formData.disease}
                          required
                          sx={fieldSx}
                        >
                          {diseaseOptions.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                              {d.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Alert
                          severity="info"
                          sx={{
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 2
                          }}
                        >
                          Foods to avoid will be generated based on your disease.
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* STEP 2: Meal */}
            {activeStep === 2 && (
              <Grid item xs={12}>
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: '#fff3e0',
                    '&:hover': { boxShadow: 10 }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🍽️ Meal Preferences
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          name="mealCategory"
                          label="Meal Category"
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          value={formData.mealCategory}
                          required
                          sx={fieldSx}
                        >
                          <MenuItem value="breakfast">Breakfast</MenuItem>
                          <MenuItem value="lunch">Lunch</MenuItem>
                          <MenuItem value="dinner">Dinner</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          name="foodPreference"
                          label="Food Preference"
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          value={formData.foodPreference}
                          required
                          sx={fieldSx}
                        >
                          <MenuItem value="veg">Vegetarian</MenuItem>
                          <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Alert
                          severity="success"
                          sx={{
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 2
                          }}
                        >
                          Output: Full meal + Portion % + Nutrients
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* STEP 3: Review */}
            {activeStep === 3 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ✅ Review Your Inputs
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Personal
                            </Typography>

                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person fontSize="small" />
                                <Typography variant="body2">
                                  <b>Age:</b> {formData.age}
                                </Typography>
                              </Box>

                              <Typography variant="body2">
                                <b>Gender:</b> {formData.gender}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MonitorWeight fontSize="small" />
                                <Typography variant="body2">
                                  <b>Weight:</b> {formData.weight} kg
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Height fontSize="small" />
                                <Typography variant="body2">
                                  <b>Height:</b> {formData.height} cm
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Health & Meal
                            </Typography>

                            <Stack spacing={1.2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HealthAndSafety fontSize="small" />
                                <Chip
                                  label={`Disease: ${getDiseaseLabel(formData.disease)}`}
                                  color="info"
                                  size="small"
                                />
                              </Box>

                              <Chip label={`Meal: ${formData.mealCategory}`} color="warning" size="small" />
                              <Chip
                                label={`Preference: ${formData.foodPreference}`}
                                color={formData.foodPreference === 'veg' ? 'success' : 'secondary'}
                                size="small"
                              />
                            </Stack>

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                              Your meal plan is generated automatically.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* NAVIGATION (below card) */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 700 }}>
                  <Grid container spacing={2}>
                    {/* BACK */}
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        sx={{ py: 1.2, borderRadius: 2 }}
                      >
                        Back
                      </Button>
                    </Grid>

                    {/* NEXT only for steps 0-2 */}
                    {activeStep < 3 ? (
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          endIcon={<ArrowForward />}
                          onClick={handleNext}
                          disabled={!stepValid(activeStep)}
                          sx={{ py: 1.2, borderRadius: 2 }}
                        >
                          Next
                        </Button>
                      </Grid>
                    ) : (
                      <Grid item xs={12} sm={4} />
                    )}

                    {/* RESET */}
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setFormData({
                            age: '',
                            gender: '',
                            weight: '',
                            height: '',
                            disease: '',
                            mealCategory: '',
                            foodPreference: ''
                          });
                          setResult(null);
                          setHasGenerated(false);
                          setActiveStep(0);
                        }}
                        sx={{ py: 1.2, borderRadius: 2 }}
                      >
                        Reset
                      </Button>
                    </Grid>
                  </Grid>

                  {activeStep < 3 && !stepValid(activeStep) && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                    >
                      Please complete the required fields to continue.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* RESULTS (only after auto-generate on step 3) */}
        {activeStep === 3 && hasGenerated && result && (
          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              🌿 Personalized Results
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Card elevation={4}>
                  <CardContent>
                    <Spa color="primary" />
                    <Typography variant="h6">BMI Results</Typography>

                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <b>Calculated BMI:</b> {result?.user_bmi}
                    </Typography>

                    <Typography variant="body1" component="div">
                      <b>Predicted BMI Category:</b>{' '}
                      <Chip
                        size="small"
                        label={result?.predicted_bmi_category}
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Typography>

                    <Chip label="ML Verified" color="success" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Card elevation={4}>
                  <CardContent>
                    <Favorite color="error" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Food to Avoid
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      {(result?.foods_to_avoid ? String(result.foods_to_avoid).split(',') : []).map(
                        (t, idx) => (
                          <Chip
                            key={idx}
                            label={t.trim()}
                            color="warning"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Card elevation={4}>
                  <CardContent>
                    <LocalDining color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }} gutterBottom>
                      Recommended Meal Plan (Complete Meal)
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Dish</strong>
                          </TableCell>
                          <TableCell width={170}>
                            <strong>Portion %</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {(result?.meal_plan ?? []).map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item?.dish}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {item?.portion_pct}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, Number(item?.portion_pct) || 0)}
                                sx={{ height: 8, borderRadius: 8 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      Portion % indicates each dish’s contribution to the full meal (BMI-adjusted).
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Nutrient Summary
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                      <Chip label={`Calories: ${result?.totals?.calories_kcal ?? '-'} kcal`} />
                      <Chip label={`Protein: ${result?.totals?.protein_g ?? '-'} g`} />
                      <Chip label={`Carbs: ${result?.totals?.carbs_g ?? '-'} g`} />
                      <Chip label={`Fats: ${result?.totals?.fats_g ?? '-'} g`} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* NEW: SHAD RASA TABLE (from CSV mapping) */}
            <Card elevation={4} sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ayurvedic Taste Separation (Shad Rasa)
                </Typography>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 220 }}>
                        <strong>Taste</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Dishes (from your meal plan)</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {ALL_RASAS.map((rasa) => (
                      <TableRow key={rasa}>
                        <TableCell>{rasaLabel(rasa)}</TableCell>
                        <TableCell>
                          {(rasaGrouped?.[rasa] ?? []).length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          ) : (
                            (rasaGrouped?.[rasa] ?? []).map((x, i) => (
                              <Chip
                                key={`${rasa}-${i}`}
                                label={`${x.dish} (${x.portion_pct}%)`}
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* unknown (not found in CSV) */}
                    <TableRow>
                      <TableCell>
                        <b>Not matched</b>
                      </TableCell>
                      <TableCell>
                        {(rasaGrouped?.unknown ?? []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : (
                          (rasaGrouped?.unknown ?? []).map((x, i) => (
                            <Chip
                              key={`unknown-${i}`}
                              label={`${x.dish} (${x.portion_pct}%)`}
                              color="warning"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Taste mapping is read from <b>public/ayurvedic_food_tastes.csv</b>. If a dish name doesn’t match exactly,
                  it appears under “Not matched”.
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Insights />}
                  sx={{ py: 1.6, borderRadius: 3, fontSize: '1.05rem' }}
                >
                  Generate Monthly Report (Coming Soon)
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
}