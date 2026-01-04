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
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import { Medication, Science, Spa, LocalFlorist } from '@mui/icons-material';

// Simple herb database with dosage info
const herbDatabase = {
  Amalaki: { dosage: '3-6g', timing: 'Twice daily', with: 'Honey/Water' },
  Ashwagandha: { dosage: '3-5g', timing: 'Bedtime', with: 'Warm Milk' },
  Brahmi: { dosage: '2-5g', timing: 'Morning', with: 'Ghee/Honey' },
  Gudmar: { dosage: '2-4g', timing: 'Before meals', with: 'Warm Water' },
  Guggulu: { dosage: '1-3g', timing: 'Twice daily', with: 'Water' },
  Jatamansi: { dosage: '1-3g', timing: 'Bedtime', with: 'Warm Milk' },
  Neem: { dosage: '2-4g', timing: 'Morning', with: 'Water/Honey' },
  Nirgundi: { dosage: '3-5g', timing: 'Twice daily', with: 'Water' },
  Pippali: { dosage: '1-2g', timing: 'With meals', with: 'Honey/Ghee' },
  Shankhapushpi: { dosage: '3-5g', timing: 'Morning', with: 'Milk/Honey' },
  Triphala: { dosage: '3-6g', timing: 'Bedtime', with: 'Warm Water' },
  Tulsi: { dosage: '2-3g', timing: 'Morning', with: 'Tea/Honey' },
  Turmeric: { dosage: '2-4g', timing: 'With meals', with: 'Milk/Water' },
  Vasaka: { dosage: '2-3g', timing: 'Twice daily', with: 'Honey' },
  Yashtimadhu: { dosage: '2-3g', timing: 'Twice daily', with: 'Milk/Honey' },
};

export default function MedicinePage() {
  const [formData, setFormData] = useState({
    disease: '',
    severity: '',
    dosha: '',
    ageGroup: '',
  });
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPredictions = (data) => {
    const predictionMap = {
      'Diabetes-Kapha-Medium-Adult': [
        { herb: 'Gudmar', sinhalaName: 'කවුකුරුඳු (Kawukurundu)', confidence: 0.42 },
        { herb: 'Neem', sinhalaName: 'කොහොඹ (Kohomba)', confidence: 0.28 },
        { herb: 'Amalaki', sinhalaName: 'නෙල්ලි (Nelli)', confidence: 0.18 },
      ],
      'Diabetes-Pitta-Medium-Adult': [
        { herb: 'Amalaki', sinhalaName: 'නෙල්ලි (Nelli)', confidence: 0.45 },
        { herb: 'Gudmar', sinhalaName: 'කවුකුරුඳු (Kawukurundu)', confidence: 0.32 },
        { herb: 'Neem', sinhalaName: 'කොහොඹ (Kohomba)', confidence: 0.15 },
      ],
      'Arthritis-Vata-High-Elder': [
        { herb: 'Ashwagandha', sinhalaName: 'අස්වගන්ධා (Aswagandha)', confidence: 0.48 },
        { herb: 'Guggulu', sinhalaName: 'ගුග්ගුලු (Guggulu)', confidence: 0.35 },
        { herb: 'Nirgundi', sinhalaName: 'නිර්ගුණ්ඩි (Nirgundi)', confidence: 0.12 },
      ],
      'Gastritis-Pitta-Medium-Adult': [
        { herb: 'Amalaki', sinhalaName: 'නෙල්ලි (Nelli)', confidence: 0.54 },
        { herb: 'Yashtimadhu', sinhalaName: 'වල්මි (Walmi)', confidence: 0.27 },
        { herb: 'Triphala', sinhalaName: 'ත්‍රිඵලා (Triphala)', confidence: 0.13 },
      ],
      'Asthma-Kapha-Medium-Adult': [
        { herb: 'Vasaka', sinhalaName: 'අඩතොඩ (Adatoda)', confidence: 0.42 },
        { herb: 'Pippali', sinhalaName: 'ටිප්පිලි (Tippili)', confidence: 0.35 },
        { herb: 'Tulsi', sinhalaName: 'මදුරුතල (Maduruthala)', confidence: 0.15 },
      ],
      'Anxiety-Vata-Low-Adult': [
        { herb: 'Ashwagandha', sinhalaName: 'අස්වගන්ධා (Aswagandha)', confidence: 0.48 },
        { herb: 'Brahmi', sinhalaName: 'ලුණුවිල (Lunuwila)', confidence: 0.32 },
        { herb: 'Shankhapushpi', sinhalaName: 'විෂ්ණුක්‍රාන්ති (Vishnukranthi)', confidence: 0.14 },
      ],
    };

    const key = `${data.disease}-${data.dosha}-${data.severity}-${data.ageGroup}`;
    return (
      predictionMap[key] || [
        { herb: 'Triphala', sinhalaName: 'ත්‍රිඵලා (Triphala)', confidence: 0.35 },
        { herb: 'Amalaki', sinhalaName: 'නෙල්ලි (Nelli)', confidence: 0.28 },
        { herb: 'Tulsi', sinhalaName: 'මදුරුතල (Maduruthala)', confidence: 0.22 },
      ]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const results = getPredictions(formData);
      setPredictions(results);
      setLoading(false);
    }, 1500);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cute Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Medication sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h4" gutterBottom fontWeight={700}>
          🌿 Ayurvedic Herb Recommendation
        </Typography>
        
      </Paper>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              📋 Tell us about the patient
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="Condition"
                value={formData.disease}
                onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="Diabetes">Diabetes</MenuItem>
                <MenuItem value="Arthritis">Arthritis</MenuItem>
                <MenuItem value="Asthma">Asthma</MenuItem>
                <MenuItem value="Gastritis">Gastritis</MenuItem>
                
                <MenuItem value="Migraine">Migraine</MenuItem>
              
              </TextField>

              <TextField
                select
                fullWidth
                label="Dosha Type"
                value={formData.dosha}
                onChange={(e) => setFormData({ ...formData, dosha: e.target.value })}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="Vata">Vata </MenuItem>
                <MenuItem value="Pitta">Pitta</MenuItem>
                <MenuItem value="Kapha">Kapha </MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="Low">Mild</MenuItem>
                <MenuItem value="Medium">Moderate</MenuItem>
                <MenuItem value="High">Severe</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Age Group"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                required
                sx={{ mb: 3 }}
              >
                <MenuItem value="Child">Child (0-16)</MenuItem>
                <MenuItem value="Adult">Adult (16-60)</MenuItem>
                <MenuItem value="Elder">Elder (60+)</MenuItem>
              </TextField>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={<Science />}
                sx={{
                  background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
              >
                {loading ? 'Finding herbs...' : '✨ Get Recommendations'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
            {loading && (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Spa sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Analyzing...
                </Typography>
                <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mt: 2 }} />
              </Box>
            )}

            {!loading && !predictions && (
              <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                <LocalFlorist sx={{ fontSize: 100, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Fill the form to get started!</Typography>
              </Box>
            )}

            {!loading && predictions && (
              <Box>
                {/* Best Recommendation */}
                <Box mb={4}>
                  <Typography variant="h5" gutterBottom color="primary" fontWeight={700}>
                    ✨ Best Recommendation
                  </Typography>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                      border: '3px solid #4a7c2c',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom>
  🌿 {predictions[0].herb}
</Typography>
<Typography variant="h6" color="text.secondary" gutterBottom>
  {predictions[0].sinhalaName}
</Typography>

                      
                    </CardContent>
                  </Card>
                </Box>

                {/* Alternative Recommendations */}
                <Box>
                  <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={600}>
                    📋 Top 3 Recommendations
                  </Typography>
                  <Stack spacing={2}>
                    {predictions.map((pred, index) => {
                      const herbInfo = herbDatabase[pred.herb];

                      return (
                        <Card key={index} sx={{ borderLeft: '4px solid #6a8759' }}>
                          <CardContent>
                           <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
  {pred.herb}
</Typography>
<Typography variant="body2" color="text.secondary" gutterBottom>
  {pred.sinhalaName}
</Typography>
                            
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>

                <Paper
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: '#fff3cd',
                    border: '2px dashed #ffc107',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ⚠️ <strong>Note:</strong> Always consult an Ayurvedic practitioner
                    before starting any herbal treatment.
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}