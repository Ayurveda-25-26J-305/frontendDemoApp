'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalHospital,
  Spa,
  Psychology,
  TrendingUp,
  Info,
  History,
  Download,
  Delete,
  CheckCircle
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Symptom options
const SYMPTOMS = [
  'Irregular burning sensation',
  'Bloating with gas',
  'Abdominal pain',
  'Constipation',
  'Intense burning sensation',
  'Sour belching',
  'Acid regurgitation',
  'Nausea',
  'Heavy feeling in stomach',
  'Sweet taste in mouth',
  'Loss of appetite',
  'Excessive salivation',
  'Severe joint pain',
  'Joint stiffness in morning',
  'Crackling sound in joints',
  'Difficulty in movement',
  'Burning sensation in joints',
  'Redness around joints',
  'Fever with joint pain',
  'Inflammation',
  'Joint swelling',
  'Heaviness in joints',
  'Coldness in affected area',
  'Reduced flexibility',
  'Excessive urination',
  'Dry mouth',
  'Weight loss',
  'Fatigue',
  'Excessive thirst',
  'Burning sensation while urinating',
  'Yellowish urine',
  'Excessive hunger',
  'Turbid urine',
  'Excessive sleep',
  'Heaviness in body',
  'Throbbing headache',
  'One-sided head pain',
  'Sensitivity to light',
  'Dizziness',
  'Burning sensation in head',
  'Redness in eyes',
  'Nausea with headache',
  'Visual disturbances',
  'Heaviness in head',
  'Dull aching pain',
  'Excessive sleep with headache',
  'Nasal congestion',
  'Dry cough',
  'Difficulty breathing',
  'Chest tightness',
  'Wheezing sound',
  'Burning sensation in chest',
  'Fever with breathing difficulty',
  'Yellowish sputum',
  'Excessive thirst with breathlessness',
  'Productive cough',
  'White thick sputum',
  'Heaviness in chest',
  'Relief after expectoration'
];

// Disease information
const DISEASE_INFO = {
  Gastritis: {
    sanskrit: 'Amlapitta',
    description: 'A digestive disorder characterized by burning sensation and acidity.',
    dosha: 'Primarily Pitta imbalance',
    symptoms: 'Burning sensation, sour belching, nausea, loss of appetite',
    lifestyle: [
      'Avoid spicy and acidic foods',
      'Eat at regular intervals',
      'Practice stress management',
      'Get adequate sleep'
    ],
    diet: [
      'Cool, soothing foods',
      'Fresh fruits (sweet)',
      'Coconut water',
      'Avoid caffeine and alcohol'
    ]
  },
  Arthritis: {
    sanskrit: 'Amavata',
    description: 'Joint inflammation causing pain, stiffness, and swelling.',
    dosha: 'Vata-Kapha imbalance',
    symptoms: 'Joint pain, morning stiffness, swelling, reduced mobility',
    lifestyle: [
      'Regular gentle exercise',
      'Warm oil massage',
      'Avoid cold, damp environments',
      'Maintain healthy weight'
    ],
    diet: [
      'Warm, cooked foods',
      'Anti-inflammatory spices',
      'Avoid cold drinks',
      'Include ginger and turmeric'
    ]
  },
  Diabetes: {
    sanskrit: 'Prameha',
    description: 'A metabolic disorder affecting blood sugar levels.',
    dosha: 'Primarily Kapha imbalance',
    symptoms: 'Excessive thirst, frequent urination, fatigue, weight changes',
    lifestyle: [
      'Regular physical activity',
      'Weight management',
      'Stress reduction',
      'Adequate sleep'
    ],
    diet: [
      'Low glycemic index foods',
      'Bitter vegetables',
      'Whole grains',
      'Avoid refined sugars'
    ]
  },
  Migraine: {
    sanskrit: 'Ardhavabhedaka',
    description: 'Severe one-sided headache with associated symptoms.',
    dosha: 'Primarily Vata-Pitta imbalance',
    symptoms: 'Throbbing headache, sensitivity to light, nausea, visual disturbances',
    lifestyle: [
      'Regular sleep schedule',
      'Avoid triggers',
      'Practice relaxation techniques',
      'Stay hydrated'
    ],
    diet: [
      'Regular meal times',
      'Avoid fermented foods',
      'Fresh, light foods',
      'Avoid chocolate and cheese'
    ]
  },
  Asthma: {
    sanskrit: 'Shwasa',
    description: 'Respiratory condition causing breathing difficulty.',
    dosha: 'Primarily Kapha-Vata imbalance',
    symptoms: 'Wheezing, shortness of breath, chest tightness, coughing',
    lifestyle: [
      'Avoid allergens',
      'Practice breathing exercises',
      'Keep environment clean',
      'Avoid cold exposure'
    ],
    diet: [
      'Warm, light foods',
      'Avoid dairy products',
      'Ginger and honey',
      'Avoid cold beverages'
    ]
  }
};

function App() {
  // Tab management
  const [currentTab, setCurrentTab] = useState(0);

  // Patient information
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState('Male');
  const [location, setLocation] = useState('');

  // Prakriti assessment
  const [bodyBuild, setBodyBuild] = useState('Medium');
  const [skinType, setSkinType] = useState('Warm/Oily');
  const [appetite, setAppetite] = useState('Strong');
  const [sleepPattern, setSleepPattern] = useState('Moderate');
  const [mentalActivity, setMentalActivity] = useState('Sharp/Focused');
  const [temperament, setTemperament] = useState('Irritable/Angry');

  // Dosha scores
  const [vataScore, setVataScore] = useState(0.33);
  const [pittaScore, setPittaScore] = useState(0.33);
  const [kaphaScore, setKaphaScore] = useState(0.33);
  const [prakriti, setPrakriti] = useState('');

  // Symptoms
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [durationDays, setDurationDays] = useState(7);
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Prediction
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Calculate Prakriti scores
  useEffect(() => {
    let vata = 0, pitta = 0, kapha = 0;

    // Body build
    if (bodyBuild === 'Thin/Light') vata++;
    else if (bodyBuild === 'Medium') pitta++;
    else kapha++;

    // Skin type
    if (skinType === 'Dry/Rough') vata++;
    else if (skinType === 'Warm/Oily') pitta++;
    else kapha++;

    // Appetite
    if (appetite === 'Irregular') vata++;
    else if (appetite === 'Strong') pitta++;
    else kapha++;

    // Sleep
    if (sleepPattern === 'Light/Interrupted') vata++;
    else if (sleepPattern === 'Moderate') pitta++;
    else kapha++;

    // Mental
    if (mentalActivity === 'Restless/Active') vata++;
    else if (mentalActivity === 'Sharp/Focused') pitta++;
    else kapha++;

    // Temperament
    if (temperament === 'Anxious/Worried') vata++;
    else if (temperament === 'Irritable/Angry') pitta++;
    else kapha++;

    const total = vata + pitta + kapha;
    const vScore = total > 0 ? vata / total : 0.33;
    const pScore = total > 0 ? pitta / total : 0.33;
    const kScore = total > 0 ? kapha / total : 0.33;

    setVataScore(vScore);
    setPittaScore(pScore);
    setKaphaScore(kScore);

    // Determine dominant Prakriti
    const scores = { Vata: vScore, Pitta: pScore, Kapha: kScore };
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted[0][1] - sorted[1][1] > 0.15) {
      setPrakriti(sorted[0][0]);
    } else {
      setPrakriti(`${sorted[0][0]}-${sorted[1][0]}`);
    }
  }, [bodyBuild, skinType, appetite, sleepPattern, mentalActivity, temperament]);

  // Handle prediction
  const handlePredict = async () => {
    if (!symptom) {
      alert('Please select a symptom');
      return;
    }

    setLoading(true);

    try {
      // Call your Flask API here
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age,
          gender,
          symptom,
          severity,
          duration_days: durationDays,
          vata_score: vataScore,
          pitta_score: pittaScore,
          kapha_score: kaphaScore,
          prakriti: prakriti.split('-')[0]
        }),
      });

      const data = await response.json();

      setPrediction(data);

      // Add to history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        patientName: patientName || 'Anonymous',
        age,
        gender,
        prakriti,
        symptom,
        severity,
        duration: durationDays,
        predictedDisease: data.predicted_disease,
        confidence: data.confidence
      };

      setPredictionHistory([historyEntry, ...predictionHistory]);

    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error connecting to prediction service. Using demo data.');

      // Demo prediction for testing
      const demoData = {
        predicted_disease: 'Gastritis',
        confidence: 0.875,
        top_3: [
          { disease: 'Gastritis', probability: 0.875 },
          { disease: 'Diabetes', probability: 0.062 },
          { disease: 'Arthritis', probability: 0.031 }
        ],
        probabilities: {
          Gastritis: 0.875,
          Arthritis: 0.031,
          Diabetes: 0.062,
          Migraine: 0.020,
          Asthma: 0.012
        }
      };

      setPrediction(demoData);

      const historyEntry = {
        timestamp: new Date().toISOString(),
        patientName: patientName || 'Anonymous',
        age,
        gender,
        prakriti,
        symptom,
        severity,
        duration: durationDays,
        predictedDisease: demoData.predicted_disease,
        confidence: demoData.confidence
      };

      setPredictionHistory([historyEntry, ...predictionHistory]);
    }

    setLoading(false);
    setCurrentTab(0); // Stay on prediction tab to see results
  };

  // Download history as CSV
  const downloadHistory = () => {
    const csv = [
      ['Timestamp', 'Patient', 'Age', 'Gender', 'Prakriti', 'Symptom', 'Disease', 'Confidence'],
      ...predictionHistory.map(h => [
        new Date(h.timestamp).toLocaleString(),
        h.patientName,
        h.age,
        h.gender,
        h.prakriti,
        h.symptom,
        h.predictedDisease,
        (h.confidence * 100).toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Dosha chart data
  const doshaChartData = {
    labels: ['Vata', 'Pitta', 'Kapha'],
    datasets: [
      {
        label: 'Dosha Distribution',
        data: [vataScore, pittaScore, kaphaScore],
        backgroundColor: [
          'rgba(255, 107, 107, 0.8)',
          'rgba(78, 205, 196, 0.8)',
          'rgba(69, 183, 209, 0.8)'
        ],
        borderColor: [
          'rgba(255, 107, 107, 1)',
          'rgba(78, 205, 196, 1)',
          'rgba(69, 183, 209, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const doshaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${(context.parsed * 100).toFixed(0)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`
        }
      }
    }
  };

  // Probability chart data
  const probabilityChartData = prediction ? {
    labels: Object.keys(prediction.probabilities || {}),
    datasets: [
      {
        label: 'Probability',
        data: Object.values(prediction.probabilities || {}),
        backgroundColor: 'rgba(45, 80, 22, 0.8)',
        borderColor: 'rgba(45, 80, 22, 1)',
        borderWidth: 2,
      },
    ],
  } : null;

  const probabilityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${(context.parsed * 100).toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`
        }
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
          {/* Header */}
          <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Spa sx={{ fontSize: 48, color: '#fff' }} />
              <Box>
                <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                  Ayurvedic Disease Prediction
                </Typography>
                <Typography variant="h6" sx={{ color: '#c8e6c9' }}>
                  Constitutional-Aware AI System
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<CheckCircle />} 
                label="84.2% Accuracy" 
                sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 600 }} 
              />
              <Chip 
                icon={<TrendingUp />} 
                label="10% Improvement" 
                sx={{ bgcolor: '#8bc34a', color: '#fff', fontWeight: 600 }} 
              />
              <Chip 
                label="5 Diseases Covered" 
                sx={{ bgcolor: '#689f38', color: '#fff', fontWeight: 600 }} 
              />
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab icon={<LocalHospital />} label="Prediction" />
              <Tab icon={<Info />} label="About System" />
              <Tab icon={<History />} label="History" />
              <Tab icon={<Psychology />} label="Help" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* Left Column - Input */}
              <Grid item xs={12} md={6}>
                {/* Patient Information */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital /> Patient Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Patient Name (Optional)"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            value={gender}
                            label="Gender"
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location/Hospital (Optional)"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Prakriti Assessment */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Spa /> Prakriti Assessment
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>What is Prakriti?</strong><br />
                      Your unique body constitution determined by Vata, Pitta, and Kapha balance.
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Body Build</FormLabel>
                          <RadioGroup row value={bodyBuild} onChange={(e) => setBodyBuild(e.target.value)}>
                            <FormControlLabel value="Thin/Light" control={<Radio />} label="Thin/Light" />
                            <FormControlLabel value="Medium" control={<Radio />} label="Medium" />
                            <FormControlLabel value="Large/Heavy" control={<Radio />} label="Large/Heavy" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Skin Type</FormLabel>
                          <RadioGroup row value={skinType} onChange={(e) => setSkinType(e.target.value)}>
                            <FormControlLabel value="Dry/Rough" control={<Radio />} label="Dry/Rough" />
                            <FormControlLabel value="Warm/Oily" control={<Radio />} label="Warm/Oily" />
                            <FormControlLabel value="Thick/Cool" control={<Radio />} label="Thick/Cool" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Appetite</FormLabel>
                          <RadioGroup row value={appetite} onChange={(e) => setAppetite(e.target.value)}>
                            <FormControlLabel value="Irregular" control={<Radio />} label="Irregular" />
                            <FormControlLabel value="Strong" control={<Radio />} label="Strong" />
                            <FormControlLabel value="Steady/Slow" control={<Radio />} label="Steady/Slow" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Sleep Pattern</FormLabel>
                          <RadioGroup row value={sleepPattern} onChange={(e) => setSleepPattern(e.target.value)}>
                            <FormControlLabel value="Light/Interrupted" control={<Radio />} label="Light" />
                            <FormControlLabel value="Moderate" control={<Radio />} label="Moderate" />
                            <FormControlLabel value="Deep/Long" control={<Radio />} label="Deep" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Mental Activity</FormLabel>
                          <RadioGroup row value={mentalActivity} onChange={(e) => setMentalActivity(e.target.value)}>
                            <FormControlLabel value="Restless/Active" control={<Radio />} label="Restless" />
                            <FormControlLabel value="Sharp/Focused" control={<Radio />} label="Sharp" />
                            <FormControlLabel value="Calm/Steady" control={<Radio />} label="Calm" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel>Temperament</FormLabel>
                          <RadioGroup row value={temperament} onChange={(e) => setTemperament(e.target.value)}>
                            <FormControlLabel value="Anxious/Worried" control={<Radio />} label="Anxious" />
                            <FormControlLabel value="Irritable/Angry" control={<Radio />} label="Irritable" />
                            <FormControlLabel value="Calm/Attached" control={<Radio />} label="Calm" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>Your Constitution:</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'rgba(255, 107, 107, 0.1)', textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 700 }}>
                              {(vataScore * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="body2">Vata</Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'rgba(78, 205, 196, 0.1)', textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ color: '#4ecdc4', fontWeight: 700 }}>
                              {(pittaScore * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="body2">Pitta</Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'rgba(69, 183, 209, 0.1)', textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ color: '#45b7d1', fontWeight: 700 }}>
                              {(kaphaScore * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="body2">Kapha</Typography>
                          </Card>
                        </Grid>
                      </Grid>
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <strong>Dominant Prakriti: {prakriti}</strong>
                      </Alert>
                    </Box>

                    <Box sx={{ height: 250, mt: 3 }}>
                      <Bar data={doshaChartData} options={doshaChartOptions} />
                    </Box>
                  </CardContent>
                </Card>

                {/* Symptoms */}
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Symptoms & Health Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Primary Symptom</InputLabel>
                          <Select
                            value={symptom}
                            label="Primary Symptom"
                            onChange={(e) => setSymptom(e.target.value)}
                          >
                            {SYMPTOMS.map((s) => (
                              <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset" fullWidth>
                          <FormLabel>Symptom Severity</FormLabel>
                          <RadioGroup row value={severity} onChange={(e) => setSeverity(e.target.value)}>
                            <FormControlLabel value="Mild" control={<Radio />} label="Mild" />
                            <FormControlLabel value="Moderate" control={<Radio />} label="Moderate" />
                            <FormControlLabel value="Severe" control={<Radio />} label="Severe" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography gutterBottom>
                          Duration: {durationDays} days
                        </Typography>
                        <Slider
                          value={durationDays}
                          onChange={(e, newValue) => setDurationDays(newValue)}
                          min={1}
                          max={365}
                          marks={[
                            { value: 1, label: '1' },
                            { value: 30, label: '30' },
                            { value: 90, label: '90' },
                            { value: 180, label: '180' },
                            { value: 365, label: '365' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Additional Information (Optional)"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Any other symptoms or details..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          onClick={handlePredict}
                          disabled={loading || !symptom}
                          sx={{ py: 2, fontSize: '1.1rem' }}
                        >
                          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Predict Disease'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Results */}
              <Grid item xs={12} md={6}>
                {prediction ? (
                  <>
                    {/* Main Prediction */}
                    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
                          Prediction Result
                        </Typography>
                        <Typography variant="h3" sx={{ color: '#0d47a1', fontWeight: 700, my: 2 }}>
                          {prediction.predicted_disease}
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#555' }}>
                          Confidence: {(prediction.confidence * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={prediction.confidence * 100} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5, 
                            mt: 2,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50'
                            }
                          }} 
                        />
                      </CardContent>
                    </Card>

                    {/* Top 3 Predictions */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          Top 3 Predictions
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {prediction.top_3 && prediction.top_3.map((item, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body1" fontWeight={600}>
                                {index + 1}. {item.disease}
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {(item.probability * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.probability * 100}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: index === 0 ? '#4caf50' : index === 1 ? '#2196f3' : '#ff9800'
                                }
                              }}
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Probability Chart */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          Probability Distribution
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ height: 300 }}>
                          {probabilityChartData && (
                            <Bar data={probabilityChartData} options={probabilityChartOptions} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Disease Information */}
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          About {prediction.predicted_disease}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {DISEASE_INFO[prediction.predicted_disease] && (
                          <>
                            <Typography variant="body1" paragraph>
                              <strong>Sanskrit Name:</strong> {DISEASE_INFO[prediction.predicted_disease].sanskrit}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Description:</strong> {DISEASE_INFO[prediction.predicted_disease].description}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Dosha Involvement:</strong> {DISEASE_INFO[prediction.predicted_disease].dosha}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Common Symptoms:</strong> {DISEASE_INFO[prediction.predicted_disease].symptoms}
                            </Typography>

                            <Alert severity="warning" sx={{ my: 2 }}>
                              <strong>⚠️ Important Note:</strong><br />
                              These are general recommendations. Please consult a qualified Ayurvedic practitioner for personalized diagnosis and treatment.
                            </Alert>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                              Lifestyle Recommendations:
                            </Typography>
                            <ul>
                              {DISEASE_INFO[prediction.predicted_disease].lifestyle.map((item, index) => (
                                <li key={index}><Typography variant="body2">{item}</Typography></li>
                              ))}
                            </ul>

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                              Dietary Suggestions:
                            </Typography>
                            <ul>
                              {DISEASE_INFO[prediction.predicted_disease].diet.map((item, index) => (
                                <li key={index}><Typography variant="body2">{item}</Typography></li>
                              ))}
                            </ul>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <LocalHospital sx={{ fontSize: 100, mb: 2 }} />
                      <Typography variant="h5" color="text.secondary">
                        Fill in the form and click "Predict Disease" to see results
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          {/* About Tab */}
          {currentTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      System Overview
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography paragraph>
                      This AI-powered system integrates traditional Ayurvedic principles with modern machine learning to predict diseases based on:
                    </Typography>
                    <ul>
                      <li><Typography>Patient symptoms</Typography></li>
                      <li><Typography>Constitutional type (Prakriti)</Typography></li>
                      <li><Typography>Dosha imbalances (Vata, Pitta, Kapha)</Typography></li>
                      <li><Typography>Individual characteristics</Typography></li>
                    </ul>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Diseases Covered
                    </Typography>
                    <ol>
                      <li><Typography><strong>Gastritis</strong> (Amlapitta) - Digestive disorder</Typography></li>
                      <li><Typography><strong>Arthritis</strong> (Amavata) - Joint inflammation</Typography></li>
                      <li><Typography><strong>Diabetes</strong> (Prameha) - Metabolic disorder</Typography></li>
                      <li><Typography><strong>Migraine</strong> (Ardhavabhedaka) - Severe headache</Typography></li>
                      <li><Typography><strong>Asthma</strong> (Shwasa) - Respiratory condition</Typography></li>
                    </ol>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Technology
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography paragraph>
                      <strong>Algorithm:</strong> Random Forest Classifier
                    </Typography>
                    <Typography paragraph>
                      <strong>Training Data:</strong> 1,000 patients, 2,992 records
                    </Typography>
                    <Typography paragraph>
                      <strong>Features:</strong> 9 constitutional + symptom features
                    </Typography>
                    <Typography paragraph>
                      <strong>Accuracy:</strong> 84.2% on test set
                    </Typography>
                    <Typography paragraph>
                      <strong>Novelty:</strong> First ML system integrating Prakriti assessment
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Metric</strong></TableCell>
                            <TableCell align="right"><strong>Score</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Accuracy</TableCell>
                            <TableCell align="right">84.2%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Precision</TableCell>
                            <TableCell align="right">83.5%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Recall</TableCell>
                            <TableCell align="right">84.2%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>F1-Score</TableCell>
                            <TableCell align="right">83.8%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <strong>Improvement over symptom-only approach:</strong> ~10%
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              
            </Grid>
          )}

          {/* History Tab */}
          {currentTab === 2 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    Prediction History ({predictionHistory.length})
                  </Typography>
                  <Box>
                    <Tooltip title="Download as CSV">
                      <IconButton onClick={downloadHistory} disabled={predictionHistory.length === 0}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear History">
                      <IconButton 
                        onClick={() => setPredictionHistory([])} 
                        disabled={predictionHistory.length === 0}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {predictionHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <History sx={{ fontSize: 80, mb: 2 }} />
                    <Typography color="text.secondary">
                      No predictions yet. Make a prediction to see history here.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Time</strong></TableCell>
                          <TableCell><strong>Patient</strong></TableCell>
                          <TableCell><strong>Age</strong></TableCell>
                          <TableCell><strong>Gender</strong></TableCell>
                          <TableCell><strong>Prakriti</strong></TableCell>
                          <TableCell><strong>Symptom</strong></TableCell>
                          <TableCell><strong>Disease</strong></TableCell>
                          <TableCell><strong>Confidence</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {predictionHistory.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{item.patientName}</TableCell>
                            <TableCell>{item.age}</TableCell>
                            <TableCell>{item.gender}</TableCell>
                            <TableCell>{item.prakriti}</TableCell>
                            <TableCell>{item.symptom}</TableCell>
                            <TableCell><strong>{item.predictedDisease}</strong></TableCell>
                            <TableCell>
                              <Chip 
                                label={`${(item.confidence * 100).toFixed(1)}%`}
                                color={item.confidence > 0.8 ? 'success' : item.confidence > 0.6 ? 'warning' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Tab */}
          {currentTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      How to Use This System
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Step 1: Enter Patient Information
                    </Typography>
                    <Typography paragraph>
                      Fill in basic details like age, gender, and location. This helps in demographic analysis.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Step 2: Complete Prakriti Assessment
                    </Typography>
                    <Typography paragraph>
                      Answer 6 simple questions about body type, skin, appetite, sleep, mental activity, and temperament. The system will automatically calculate your Vata, Pitta, and Kapha scores.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Step 3: Describe Symptoms
                    </Typography>
                    <Typography paragraph>
                      Select the primary symptom from the dropdown, choose the severity level, and enter how long you've had the symptom.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Step 4: Get Prediction
                    </Typography>
                    <Typography paragraph>
                      Click the "Predict Disease" button. The AI will analyze your symptoms along with constitutional factors and provide a predicted disease with confidence score.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Step 5: Review Results
                    </Typography>
                    <Typography paragraph>
                      See top 3 possible diseases, read about the predicted disease, and review general recommendations. Always consult an Ayurvedic practitioner for confirmation.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Frequently Asked Questions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      What is Prakriti?
                    </Typography>
                    <Typography paragraph>
                      Prakriti is your unique body constitution determined at birth. It's based on the balance of three doshas (Vata, Pitta, Kapha) and influences your physical, mental, and emotional characteristics.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      How accurate is this system?
                    </Typography>
                    <Typography paragraph>
                      The system achieves 84.2% accuracy on test data. However, it's designed as a screening tool and should not replace professional medical diagnosis.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Can I use this for treatment?
                    </Typography>
                    <Alert severity="error" sx={{ my: 1 }}>
                      <strong>No.</strong> This system is for educational and research purposes only. Always consult a qualified Ayurvedic practitioner for proper diagnosis and treatment.
                    </Alert>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      What makes this different from other systems?
                    </Typography>
                    <Typography paragraph>
                      This is the first ML system that integrates constitutional awareness (Prakriti) with symptom analysis, showing ~10% improvement over symptom-only approaches.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Is my data stored?
                    </Typography>
                    <Typography paragraph>
                      Predictions are stored only in your current browser session for the history feature. No data is permanently stored or shared.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          
        </Container>
      </Box>
  );
}

export default App;