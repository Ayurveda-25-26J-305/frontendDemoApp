import { CONFIG, DOSHA_SYMPTOMS } from './config';

/**
 * Calculate dosha imbalance based on symptom
 */
export const calculateDoshaImbalance = (symptom, prakriti) => {
  // Find which dosha this symptom belongs to
  let affectedDosha = null;
  
  for (const [dosha, symptoms] of Object.entries(DOSHA_SYMPTOMS)) {
    if (symptoms.includes(symptom)) {
      affectedDosha = dosha;
      break;
    }
  }
  
  // If not found, default to user's prakriti
  if (!affectedDosha && prakriti) {
    affectedDosha = prakriti.toLowerCase().split('-')[0];
  }
  
  return {
    vata_imbalance: affectedDosha === 'vata' ? 1.5 : 1.0,
    pitta_imbalance: affectedDosha === 'pitta' ? 1.5 : 1.0,
    kapha_imbalance: affectedDosha === 'kapha' ? 1.5 : 1.0,
    imbalanced_dosha: affectedDosha || 'vata',
  };
};

/**
 * Adjust severity based on prakriti
 */
export const getAdjustedSeverity = (severity, prakriti) => {
  const severityMap = {
    'Mild': 0,
    'Moderate': 1,
    'Severe': 2,
  };
  
  let baseSeverity = severityMap[severity] || 1;
  
  if (!prakriti) return baseSeverity;
  
  // Vata types tend to exaggerate symptoms
  if (prakriti.includes('Vata') && baseSeverity > 0) {
    baseSeverity -= 0.2;
  }
  
  // Kapha types tend to underreport
  if (prakriti.includes('Kapha') && baseSeverity < 2) {
    baseSeverity += 0.2;
  }
  
  return Math.max(0, Math.min(2, baseSeverity));
};

/**
 * Get seasonal recommendations
 */
export const getSeasonalRecommendations = () => {
  const month = new Date().getMonth();
  const season =
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 8 ? 'summer' :
    month >= 9 && month <= 11 ? 'fall' :
    'winter';
  
  const seasonalAdvice = {
    spring: 'Kapha season - Avoid heavy, oily foods. Stay active.',
    summer: 'Pitta season - Stay cool, avoid spicy foods.',
    fall: 'Vata season - Eat warm, grounding foods. Maintain routine.',
    winter: 'Kapha season - Exercise regularly, eat light foods.',
  };
  
  return {
    season,
    advice: seasonalAdvice[season],
  };
};

/**
 * Check if symptom matches user's prakriti
 */
export const isPrioritySymptom = (symptom, prakriti) => {
  if (!prakriti || !symptom) return false;
  
  const dominantDosha = prakriti.split('-')[0].toLowerCase();
  return DOSHA_SYMPTOMS[dominantDosha]?.includes(symptom) || false;
};

/**
 * Make disease prediction API call with enhanced 12-feature payload
 */
export const predictDisease = async (payload) => {
  try {
    console.log('🌐 API URL:', `${CONFIG.API_URL}/predict`);
    console.log('📤 Enhanced Payload (12 features):', payload);
    
    const response = await fetch(`${CONFIG.API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ API Success:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    throw error;
  }
};