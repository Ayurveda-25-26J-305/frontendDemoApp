'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Papa from 'papaparse';

import {
  Container, Alert, Typography, Paper, Box, Grid, TextField, MenuItem,
  Button, Card, CardContent, Chip, Divider, LinearProgress, Stack,
  Stepper, Step, StepLabel, Table, TableBody, TableCell, TableHead,
  TableRow, CircularProgress
} from '@mui/material';

import {
  Restaurant, LocalDining, Favorite, Spa, Person, MonitorWeight,
  Height, HealthAndSafety, ArrowBack, ArrowForward, Download, CheckCircle
} from '@mui/icons-material';

// ─── BMI-ADJUSTED GRAM CALCULATION ───────────────────────────────────────────
/**
 * Calculates the total meal weight in grams for a given meal category,
 * adjusted for the user's BMI category using TDEE.
 *
 * Steps:
 * 1. BMR via Mifflin-St Jeor
 * 2. TDEE = BMR × sedentary activity factor (1.2) — conservative default
 * 3. Adjust TDEE based on BMI category (deficit/surplus)
 * 4. Split adjusted TDEE into per-meal calorie budget
 * 5. Convert calorie budget → grams using the meal's calorie density
 *    (calories_kcal / 100 kcal per ~80g is NOT used — instead we derive
 *     kcal-per-gram from the API's own nutrition data)
 *
 * @param {object} p
 * @param {number} p.age
 * @param {string} p.gender        'male' | 'female'
 * @param {number} p.weight_kg
 * @param {number} p.height_cm
 * @param {string} p.bmiCategory   'underweight'|'normal'|'overweight'|'obese'
 * @param {string} p.mealCategory  'breakfast'|'lunch'|'dinner'
 * @param {number} p.mealCalories  total kcal of the generated meal (from API)
 * @returns {number}  total grams for this meal
 */
function calcBMIAdjustedMealGrams({ age, gender, weight_kg, height_cm, bmiCategory, mealCategory, mealCalories }) {
  // 1. BMR — Mifflin-St Jeor
  let bmr;
  if ((gender || '').toLowerCase() === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  // 2. TDEE — sedentary (1.2); user can be assumed lightly active at minimum
  const tdee = bmr * 1.2;

  // 3. Adjust TDEE based on BMI category
  //    underweight → +15% (caloric surplus to gain weight)
  //    normal      → ±0%  (maintenance)
  //    overweight  → -10% (mild deficit)
  //    obese       → -20% (moderate deficit)
  const adjustments = { underweight: 1.15, normal: 1.0, overweight: 0.90, obese: 0.80 };
  const adj = adjustments[(bmiCategory || 'normal').toLowerCase()] ?? 1.0;
  const adjustedTDEE = tdee * adj;

  // 4. Per-meal calorie budget as fraction of daily TDEE
  //    breakfast 25% | lunch 35% | dinner 30% | snacks 10% (not used here)
  const mealFractions = { breakfast: 0.25, lunch: 0.35, dinner: 0.30 };
  const fraction = mealFractions[(mealCategory || 'lunch').toLowerCase()] ?? 0.30;
  const mealCalorieBudget = adjustedTDEE * fraction;

  // 5. Convert calorie budget → grams using the meal's own calorie density
  //    density (kcal/g) = mealCalories / assumed_standard_grams
  //    We use mealCalories from the API as the "energy of 100% of the meal".
  //    total_grams = mealCalorieBudget / (mealCalories / 500)
  //    where 500g is the neutral reference weight before BMI adjustment.
  const REF_GRAMS = 500;
  const kcalPerGram = (mealCalories > 0) ? (mealCalories / REF_GRAMS) : 1.0;
  const totalGrams = Math.round(mealCalorieBudget / kcalPerGram);

  // Clamp to a sensible range so nothing looks absurd
  return Math.min(Math.max(totalGrams, 150), 1200);
}

/**
 * Returns the gram value for a single dish.
 * portion_pct is applied to the BMI-adjusted total meal grams.
 */
function portionToGrams(portion_pct, totalMealGrams) {
  return Math.round((portion_pct / 100) * totalMealGrams);
}

// ─── PDF GENERATION ───────────────────────────────────────────────────────────

function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

async function downloadDietPDF(result, formData, rasaGrouped, totalMealGrams) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W    = 210;
  const PAGE_H    = 297;
  const MARGIN    = 16;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const C = {
    leaf:  [34, 85, 60],    sage:  [72, 163, 110],  gold:  [196, 145, 20],
    cream: [254, 250, 224], bark:  [100, 60, 30],   mist:  [200, 235, 215],
    white: [255, 255, 255], ink:   [28, 28, 28],    fog:   [246, 243, 232],
    red:   [190, 50, 50],   amber: [200, 130, 0],
  };

  const setFill = (rgb) => doc.setFillColor(...rgb);
  const setDraw = (rgb) => doc.setDrawColor(...rgb);
  const setTxt  = (rgb) => doc.setTextColor(...rgb);
  const setFont = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };

  const fillRRect = (x, y, w, h, r, color) => { setFill(color); doc.roundedRect(x, y, w, h, r, r, 'F'); };

  const centerText = (text, y, color, style = 'normal', size = 10) => {
    setFont(style, size); setTxt(color);
    doc.text(String(text), PAGE_W / 2, y, { align: 'center' });
  };

  const labelValue = (label, value, x, y, lc, vc) => {
    setFont('bold', 9); setTxt(lc); doc.text(label + ':', x, y);
    setFont('normal', 9); setTxt(vc); doc.text(String(value), x + 36, y);
    return y + 7;
  };

  const sectionHeader = (title, y, color = C.leaf) => {
    fillRRect(MARGIN, y, CONTENT_W, 9, 2, color);
    setFont('bold', 9); setTxt(C.white);
    doc.text(title.toUpperCase(), MARGIN + 4, y + 6);
    return y + 14;
  };

  const rule = (y, color = C.mist) => {
    setDraw(color); doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    return y + 4;
  };

  const macroBar = (label, value, unit, max, barColor, x, y, barW) => {
    setFont('normal', 8); setTxt(C.ink);
    doc.text(`${label}: ${value}${unit}`, x, y);
    setFill(C.mist);   doc.roundedRect(x, y + 2, barW, 3.5, 1, 1, 'F');
    setFill(barColor); doc.roundedRect(x, y + 2, Math.max(1, Math.min((value / max) * barW, barW)), 3.5, 1, 1, 'F');
    return y + 12;
  };

  // ── PAGE 1 ────────────────────────────────────────────────────────────────

  fillRRect(0, 0, PAGE_W, PAGE_H, 0, C.fog);
  setFill(C.leaf); doc.rect(0, 0, 5, PAGE_H, 'F');
  setFill(C.gold); doc.rect(5, 0, PAGE_W - 5, 2.5, 'F');

  fillRRect(MARGIN, 8, CONTENT_W, 44, 4, C.leaf);
  setFill(C.gold); doc.rect(MARGIN, 8, CONTENT_W, 3, 'F');
  centerText('Ayurvedic Diet Plan Report', 22, C.cream, 'bold', 18);
  centerText('Personalised Wellness · Rooted in Ancient Wisdom', 30, C.mist, 'italic', 9);
  const genDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  centerText(`Generated on ${genDate}`, 40, C.mist, 'normal', 8);
  centerText('Developed by Dias W A N M (IT22899910)', 46, C.cream, 'normal', 7);

  // Patient Profile
  let y = 62;
  y = sectionHeader('Patient Profile', y);

  const col1 = MARGIN + 4;
  const col2 = PAGE_W / 2 + 4;

  const profileLeft = [
    ['Age',    `${formData.age} years`],
    ['Gender', formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '—'],
    ['Weight', `${formData.weight} kg`],
    ['Height', `${formData.height} cm`],
  ];
  const profileRight = [
    ['BMI',       `${result.user_bmi} kg/m2`],
    ['Category',  result.predicted_bmi_category ? result.predicted_bmi_category.charAt(0).toUpperCase() + result.predicted_bmi_category.slice(1) : '—'],
    ['Condition', result.disease         ? result.disease.charAt(0).toUpperCase()         + result.disease.slice(1)         : '—'],
    ['Diet Type', result.diet_preference ? result.diet_preference.charAt(0).toUpperCase() + result.diet_preference.slice(1) : '—'],
  ];

  const startY = y;
  profileLeft.forEach(([l, v])  => { y  = labelValue(l, v, col1, y,  C.bark, C.ink); });
  let y2 = startY;
  profileRight.forEach(([l, v]) => { y2 = labelValue(l, v, col2, y2, C.bark, C.ink); });
  y = Math.max(y, y2) + 4;
  y = rule(y);

  // BMI badge
  const bmiCat   = (result.predicted_bmi_category || '').toLowerCase();
  const bmiColor = bmiCat === 'normal' ? C.sage : bmiCat === 'underweight' ? C.amber : bmiCat === 'overweight' ? C.amber : C.red;
  fillRRect(MARGIN, y, CONTENT_W, 12, 3, bmiColor);
  setFont('bold', 9); setTxt(C.white);
  doc.text(`BMI: ${result.user_bmi}  ·  ${(result.predicted_bmi_category || '').toUpperCase()}  ·  ML Verified`, PAGE_W / 2, y + 7.5, { align: 'center' });
  y += 17;

  // Meal Session Details
  y = sectionHeader('Meal Session Details', y, C.sage);
  [
    ['Meal Category',    result.meal_category   ? result.meal_category.charAt(0).toUpperCase()   + result.meal_category.slice(1)   : '—'],
    ['Diet Preference',  result.diet_preference ? result.diet_preference.charAt(0).toUpperCase() + result.diet_preference.slice(1) : '—'],
    ['Health Condition', result.disease         ? result.disease.charAt(0).toUpperCase()         + result.disease.slice(1)         : '—'],
  ].forEach(([l, v]) => { y = labelValue(l, v, col1, y, C.bark, C.ink); });
  y = rule(y + 2);

  // ── Meal Plan table ────────────────────────────────────────────────────────
  y = sectionHeader('Recommended Meal Plan', y);

  const COL_NUM   = MARGIN + 3;
  const COL_DISH  = MARGIN + 12;
  const COL_PCT   = MARGIN + CONTENT_W - 78;
  const COL_GRAMS = MARGIN + CONTENT_W - 64;
  const COL_BAR_X = MARGIN + CONTENT_W - 42;
  const COL_BAR_W = 34;
  const DISH_MAX  = COL_PCT - COL_DISH - 4;

  // Header row
  fillRRect(MARGIN, y - 5, CONTENT_W, 10, 1, C.mist);
  setFont('bold', 8); setTxt(C.leaf);
  doc.text('#',       COL_NUM,  y);
  doc.text('Dish',    COL_DISH, y);
  doc.text('Portion', COL_PCT,  y);
  doc.text('Grams',   COL_GRAMS, y);
  doc.text('Bar',     COL_BAR_X + COL_BAR_W / 2, y, { align: 'center' });
  y += 5;

  (result.meal_plan || []).forEach((item, i) => {
    const dishLines = doc.splitTextToSize(String(item.dish || ''), DISH_MAX);
    const ROW_H = Math.max(12, dishLines.length * 5 + 6);
    const rowY  = y;
    const grams = portionToGrams(item.portion_pct, totalMealGrams);

    if (i % 2 === 0) {
      setFill([245, 250, 246]);
      doc.rect(MARGIN, rowY - 3, CONTENT_W, ROW_H, 'F');
    }

    setFont('normal', 8); setTxt(C.ink);
    doc.text(String(i + 1), COL_NUM,  rowY + 2);
    doc.text(dishLines,      COL_DISH, rowY + 2);

    const midY = rowY + ROW_H / 2;

    setFont('bold', 8); setTxt(C.leaf);
    doc.text(`${item.portion_pct}%`, COL_PCT, midY + 1);

    fillRRect(COL_GRAMS - 1, midY - 3.5, 14, 6, 1.5, C.mist);
    setFont('bold', 7.5); setTxt(C.leaf);
    doc.text(`${grams}g`, COL_GRAMS + 6, midY + 0.5, { align: 'center' });

    setFill(C.mist);
    doc.roundedRect(COL_BAR_X, midY - 2.5, COL_BAR_W, 4, 1, 1, 'F');
    setFill(C.sage);
    doc.roundedRect(COL_BAR_X, midY - 2.5, Math.max(1, (item.portion_pct / 100) * COL_BAR_W), 4, 1, 1, 'F');

    y += ROW_H;
  });

  // Total row
  fillRRect(MARGIN, y, CONTENT_W, 8, 1, C.mist);
  setFont('bold', 8); setTxt(C.leaf);
  doc.text('Total Meal Weight:', COL_DISH, y + 5.5);
  setFont('bold', 8); setTxt(C.bark);
  doc.text(`${totalMealGrams} g`, COL_GRAMS, y + 5.5);
  y += 12;

  // Caption
  setFont('italic', 7); setTxt([120, 120, 120]);
  doc.text(
    `Gram values are BMI-adjusted using your TDEE (${result.predicted_bmi_category} · Mifflin-St Jeor).`,
    MARGIN + 2, y
  );
  y += 7;

  y = rule(y);

  // ── Nutrition boxes ────────────────────────────────────────────────────────
  y = sectionHeader('Nutrition Summary', y, C.bark);

  const totals = result.totals || {};
  const boxW   = (CONTENT_W - 9) / 4;
  [
    { label: 'Calories', value: totals.calories_kcal, unit: 'kcal', color: C.red  },
    { label: 'Protein',  value: totals.protein_g,     unit: 'g',    color: C.sage },
    { label: 'Carbs',    value: totals.carbs_g,        unit: 'g',    color: C.gold },
    { label: 'Fats',     value: totals.fats_g,         unit: 'g',    color: C.bark },
  ].forEach((item, i) => {
    const bx = MARGIN + i * (boxW + 3);
    fillRRect(bx, y, boxW, 20, 3, C.white);
    setDraw(item.color); doc.setLineWidth(0.6);
    doc.roundedRect(bx, y, boxW, 20, 3, 3, 'S');
    setFont('bold', 11); setTxt(item.color);
    doc.text(String(item.value ?? '—'), bx + boxW / 2, y + 10, { align: 'center' });
    setFont('normal', 7); setTxt(C.bark);
    doc.text(`${item.unit}  ${item.label}`, bx + boxW / 2, y + 17, { align: 'center' });
  });
  y += 26;

  const halfW  = (CONTENT_W - 10) / 2;
  const leftX  = MARGIN;
  const rightX = MARGIN + halfW + 10;

  macroBar('Protein',  totals.protein_g,     'g',    50,   C.sage, leftX,  y, halfW);
  macroBar('Carbs',    totals.carbs_g,        'g',    200,  C.gold, rightX, y, halfW);
  y += 12;
  macroBar('Calories', totals.calories_kcal, 'kcal', 2500, C.red,  leftX,  y, halfW);
  macroBar('Fats',     totals.fats_g,         'g',    70,   C.bark, rightX, y, halfW);
  y += 14;

  y = rule(y);

  // ── Foods to Avoid ─────────────────────────────────────────────────────────
  y = sectionHeader('Foods to Avoid', y, C.red);

  const avoidItems  = (result.foods_to_avoid ? String(result.foods_to_avoid).split(',') : [])
    .map((s) => s.trim()).filter(Boolean);
  const CHIP_H      = 7;
  const CHIP_PAD    = 4;
  const CHIP_GAP    = 3;
  const PAGE_BOTTOM = PAGE_H - 20;

  let chipX = MARGIN + 2;
  let chipY = y;
  setFont('normal', 7.5);
  avoidItems.forEach((food) => {
    const chipW = doc.getTextWidth(food) + CHIP_PAD * 2;
    if (chipX + chipW > PAGE_W - MARGIN) { chipX = MARGIN + 2; chipY += CHIP_H + 3; }
    if (chipY + CHIP_H > PAGE_BOTTOM) return;
    fillRRect(chipX, chipY - 5, chipW, CHIP_H, 1.5, [255, 230, 220]);
    setTxt(C.red);
    doc.text(food, chipX + CHIP_PAD, chipY);
    chipX += chipW + CHIP_GAP;
  });
  y = chipY + CHIP_H + 2;
  y = rule(y);

  // ── PAGE 2 ────────────────────────────────────────────────────────────────
  doc.addPage();

  fillRRect(0, 0, PAGE_W, PAGE_H, 0, C.fog);
  setFill(C.leaf); doc.rect(0, 0, 5, PAGE_H, 'F');
  setFill(C.gold); doc.rect(5, 0, PAGE_W - 5, 2.5, 'F');

  fillRRect(MARGIN, 8, CONTENT_W, 20, 4, C.leaf);
  centerText('Ayurvedic Taste Separation — Shad Rasa', 16, C.cream, 'bold', 13);
  centerText('The six tastes and their presence in your meal plan', 22, C.mist, 'italic', 8);

  y = 36;

  const ALL_RASAS_P2 = ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent'];
  const rasaLabels   = { sweet:'Sweet (Madhura)', sour:'Sour (Amla)', salty:'Salty (Lavana)', pungent:'Pungent (Katu)', bitter:'Bitter (Tikta)', astringent:'Astringent (Kashaya)' };
  const rasaColors   = { sweet:[220,170,50], sour:[190,100,40], salty:[60,130,190], pungent:[190,60,60], bitter:[60,140,80], astringent:[120,80,160] };

  ALL_RASAS_P2.forEach((rasa) => {
    const items = rasaGrouped?.[rasa] ?? [];
    const rowH  = Math.max(14, 6 + items.length * 7);
    const col   = rasaColors[rasa];

    setFill([245, 248, 246]); doc.roundedRect(MARGIN, y, CONTENT_W, rowH, 2, 2, 'F');
    setFill(col);              doc.roundedRect(MARGIN, y, 5, rowH, 1, 1, 'F');
    setFont('bold', 9); setTxt(col);
    doc.text(rasaLabels[rasa], MARGIN + 9, y + 8);

    if (items.length === 0) {
      setFont('italic', 8); setTxt([160, 160, 160]);
      doc.text('No dishes from your meal plan', MARGIN + 70, y + 8);
    } else {
      items.forEach((item, idx) => {
        const g = portionToGrams(item.portion_pct, totalMealGrams);
        setFont('normal', 8); setTxt(C.ink);
        doc.text(`• ${item.dish}  (${item.portion_pct}% · ${g}g)`, MARGIN + 70, y + 8 + idx * 7);
      });
    }

    setDraw(C.mist); doc.setLineWidth(0.2);
    doc.line(MARGIN, y + rowH, PAGE_W - MARGIN, y + rowH);
    y += rowH + 3;
  });

  const unknown = rasaGrouped?.unknown ?? [];
  if (unknown.length > 0) {
    const rowH = Math.max(14, 6 + unknown.length * 7);
    fillRRect(MARGIN, y, CONTENT_W, rowH, 2, [250, 240, 220]);
    setFill(C.amber); doc.roundedRect(MARGIN, y, 5, rowH, 1, 1, 'F');
    setFont('bold', 9); setTxt(C.amber);
    doc.text('Not Defined', MARGIN + 9, y + 8);
    unknown.forEach((item, idx) => {
      const g = portionToGrams(item.portion_pct, totalMealGrams);
      setFont('normal', 8); setTxt(C.ink);
      doc.text(`• ${item.dish}  (${item.portion_pct}% · ${g}g)`, MARGIN + 70, y + 8 + idx * 7);
    });
    y += rowH + 3;
  }

  y = rule(y + 4);

  y = sectionHeader('Ayurvedic Wellness Tips', y, C.sage);

  const diseaseTips = {
    diabetes:     ['Prefer bitter & astringent tastes to balance blood sugar.', 'Eat at fixed times daily — erratic meals disturb Vata.', 'Avoid heavy dinners after 7 PM.'],
    hypertension: ['Reduce salt & pungent foods to calm Pitta.', 'Include cooling herbs like coriander and fennel.', 'Practice mindful, slow eating.'],
    obesity:      ['Favour warm, light meals to kindle Agni (digestive fire).', 'Eat only when genuinely hungry.', 'Include digestive spices: ginger, cumin, black pepper.'],
    migraine:     ['Avoid fermented, aged, and sour foods.', 'Stay hydrated with warm water and herbal teas.', 'Maintain a consistent sleep-wake schedule.'],
    arthritis:    ['Favour warm, cooked foods over raw and cold.', 'Include anti-inflammatory spices: turmeric, ginger.', 'Avoid nightshades (tomato, potato, pepper) when possible.'],
    gastritis:    ['Eat small, frequent meals — avoid skipping.', 'Choose cooling, soothing foods: coconut, coriander.', 'Avoid spicy, fried, and very sour foods.'],
  };
  const tips = diseaseTips[(result.disease || '').toLowerCase()] || [
    'Follow seasonal eating aligned with your local climate.',
    'Chew food thoroughly — digestion begins in the mouth.',
    'Drink warm water with meals; avoid cold beverages.',
  ];
  tips.forEach((tip) => {
    setFill(C.sage); doc.circle(MARGIN + 4, y - 1.5, 1.5, 'F');
    setFont('normal', 9); setTxt(C.ink);
    const lines = doc.splitTextToSize(tip, CONTENT_W - 14);
    doc.text(lines, MARGIN + 10, y);
    y += lines.length * 5.5 + 3;
  });

  y = rule(y + 2);

  fillRRect(MARGIN, PAGE_H - 14, CONTENT_W, 10, 3, C.leaf);
  setFont('normal', 7); setTxt(C.mist);
  doc.text('This report is for wellness guidance only. Consult a qualified Ayurvedic physician before making dietary changes.', PAGE_W / 2, PAGE_H - 7, { align: 'center' });

  doc.save(`AyurvedicDietPlan_${formData.gender || 'user'}_${Date.now()}.pdf`);
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function DietPage() {
  const steps = ['Personal & Measurements', 'Health Information', 'Meal Preferences', 'Review & Results'];
  const [activeStep, setActiveStep] = useState(0);

  const fieldSx = { minWidth: 220, '& .MuiOutlinedInput-root': { height: 56 } };

  const [formData, setFormData] = useState({
    age: '', gender: '', weight: '', height: '', disease: '', mealCategory: '', foodPreference: ''
  });
  const [result, setResult]             = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [metadata, setMetadata]         = useState(null);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [pdfSuccess, setPdfSuccess]     = useState(false);

  useEffect(() => { loadMetadata(); }, []);

  const loadMetadata = async () => {
    try {
      const response = await fetch('/api/diet/metadata');
      const data = await response.json();
      setMetadata(data);
    } catch (err) { console.error('Failed to load metadata:', err); }
  };

  const diseaseOptions = useMemo(() => {
    if (metadata?.diseases) return metadata.diseases.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }));
    return [
      { value: 'diabetes', label: 'Diabetes' }, { value: 'migraine', label: 'Migraine' },
      { value: 'arthritis', label: 'Arthritis' }, { value: 'asthma', label: 'Asthma' },
      { value: 'gastritis', label: 'Gastritis' }
    ];
  }, [metadata]);

  const getDiseaseLabel = (value) => diseaseOptions.find((d) => d.value === value)?.label || value;

  const [tasteMap, setTasteMap] = useState(null);
  const ALL_RASAS = useMemo(() => ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent'], []);

  const rasaLabel = (key) => {
    const map = { sweet:'Sweet (Madhura)', sour:'Sour (Amla)', salty:'Salty (Lavana)', pungent:'Pungent (Katu)', bitter:'Bitter (Tikta)', astringent:'Astringent (Kashaya)' };
    return map[key] || key;
  };

  const norm = (s) => String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const tasteToKey = (t) => {
    const x = String(t || '').toLowerCase();
    if (x.includes('sweet'))      return 'sweet';
    if (x.includes('sour'))       return 'sour';
    if (x.includes('salty'))      return 'salty';
    if (x.includes('pungent'))    return 'pungent';
    if (x.includes('bitter'))     return 'bitter';
    if (x.includes('astringent')) return 'astringent';
    return 'astringent';
  };

  useEffect(() => {
    fetch('/ayurvedic_food_tastes.csv')
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const map = new Map();
        (parsed.data || []).forEach((row) => {
          const dish = norm(row?.Food);
          const rasaKey = tasteToKey(row?.Ayurvedic_Taste);
          if (dish) map.set(dish, rasaKey);
        });
        setTasteMap(map);
      })
      .catch(() => setTasteMap(new Map()));
  }, []);

  const rasaGrouped = useMemo(() => {
    const g = { sweet:[], sour:[], salty:[], pungent:[], bitter:[], astringent:[], unknown:[] };
    if (!result?.meal_plan) return g;
    (result.meal_plan || []).forEach((item) => {
      const rasaKey = tasteMap?.get(norm(item?.dish));
      if (!tasteMap || !rasaKey) g.unknown.push(item); else g[rasaKey].push(item);
    });
    return g;
  }, [tasteMap, result]);

  // ── BMI-adjusted total meal grams — recalculated whenever result changes ──
  const totalMealGrams = useMemo(() => {
    if (!result) return 500;
    return calcBMIAdjustedMealGrams({
      age:          parseFloat(formData.age)    || 25,
      gender:       formData.gender             || 'female',
      weight_kg:    parseFloat(formData.weight) || 60,
      height_cm:    parseFloat(formData.height) || 165,
      bmiCategory:  result.predicted_bmi_category || 'normal',
      mealCategory: result.meal_category          || 'lunch',
      mealCalories: result.totals?.calories_kcal  || 500,
    });
  }, [result, formData]);

  const handleChange = (e) => {
    setHasGenerated(false); setResult(null); setError(null); setPdfSuccess(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const stepValid = (step) => {
    if (step === 0) return !!formData.age && !!formData.gender && !!formData.weight && !!formData.height;
    if (step === 1) return !!formData.disease;
    if (step === 2) return !!formData.mealCategory && !!formData.foodPreference;
    return true;
  };

  const handleGenerate = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true); setError(null); setPdfSuccess(false);
    try {
      const payload = {
        age: parseInt(formData.age), gender: formData.gender.toLowerCase(),
        weight_kg: parseFloat(formData.weight), height_cm: parseFloat(formData.height),
        disease: formData.disease.toLowerCase(), meal_category: formData.mealCategory.toLowerCase(),
        diet_preference: formData.foodPreference.toLowerCase(),
      };
      const response = await fetch('/api/diet/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setResult({
          user_bmi: data.user_info.bmi, predicted_bmi_category: data.user_info.bmi_category,
          meal_category: data.meal_info.meal_category, diet_preference: data.meal_info.diet_preference,
          disease: data.meal_info.disease, foods_to_avoid: data.foods_to_avoid,
          meal_plan: data.meal_plan.map((dish) => ({ dish: dish.dish, portion_pct: dish.portion_percent })),
          totals: { calories_kcal: data.nutrition.total_calories_kcal, protein_g: data.nutrition.protein_g, carbs_g: data.nutrition.carbs_g, fats_g: data.nutrition.fats_g }
        });
        setHasGenerated(true);
      } else {
        setError(data.error || 'Failed to generate meal plan');
      }
    } catch (err) {
      setError('Failed to connect to diet planning service. Make sure Flask API is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!stepValid(activeStep)) return;
    if (activeStep === 2) handleGenerate({ preventDefault: () => {} });
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => {
    setHasGenerated(false); setResult(null); setPdfSuccess(false);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true); setPdfSuccess(false);
    try {
      await downloadDietPDF(result, formData, rasaGrouped, totalMealGrams);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={6} sx={{ p: 5, borderRadius: 4 }}>

        <Box textAlign="center" mb={4}>
          <Restaurant sx={{ fontSize: 90, color: 'primary.main' }} />
          <Typography variant="h3" gutterBottom>Personalized Ayurvedic Meal Planner</Typography>
          <Typography variant="body1" color="text.secondary">AI-assisted dietary guidance based on Ayurvedic principles</Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Fill step-by-step to generate a personalized meal plan.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box component="form" onSubmit={handleGenerate}>
          <Grid container spacing={4}>

            {activeStep === 0 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#e8f5e9', '&:hover': { boxShadow: 10 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🧍 Personal & Measurements</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField fullWidth name="age" label="Age (years)" type="number"
                          InputLabelProps={{ shrink: true }} inputProps={{ min: 1, max: 120 }}
                          onChange={handleChange} value={formData.age} required sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField select fullWidth name="gender" label="Gender"
                          InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.gender} required sx={fieldSx}>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField fullWidth name="weight" label="Weight (kg)" type="number"
                          InputLabelProps={{ shrink: true }} inputProps={{ min: 1, max: 250, step: 0.1 }}
                          onChange={handleChange} value={formData.weight} required sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField fullWidth name="height" label="Height (cm)" type="number"
                          InputLabelProps={{ shrink: true }} inputProps={{ min: 50, max: 250 }}
                          onChange={handleChange} value={formData.height} required sx={fieldSx} />
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      BMI will be calculated automatically after generating the meal plan.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#e3f2fd', '&:hover': { boxShadow: 10 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🩺 Health Information</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField select fullWidth name="disease" label="Disease"
                          InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.disease} required sx={fieldSx}>
                          {diseaseOptions.map((d) => (<MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Alert severity="info" sx={{ height: 56, display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                          Foods to avoid will be generated based on your disease.
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: '#fff3e0', '&:hover': { boxShadow: 10 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🍽️ Meal Preferences</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField select fullWidth name="mealCategory" label="Meal Category"
                          InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.mealCategory} required sx={fieldSx}>
                          <MenuItem value="breakfast">Breakfast</MenuItem>
                          <MenuItem value="lunch">Lunch</MenuItem>
                          <MenuItem value="dinner">Dinner</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField select fullWidth name="foodPreference" label="Food Preference"
                          InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.foodPreference} required sx={fieldSx}>
                          <MenuItem value="veg">Vegetarian</MenuItem>
                          <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Alert severity="success" sx={{ height: 56, display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                          Output: Full meal + Portion % + Nutrients
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep === 3 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>✅ Review Your Inputs</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Personal</Typography>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person fontSize="small" /><Typography variant="body2"><b>Age:</b> {formData.age}</Typography>
                              </Box>
                              <Typography variant="body2"><b>Gender:</b> {formData.gender}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MonitorWeight fontSize="small" /><Typography variant="body2"><b>Weight:</b> {formData.weight} kg</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Height fontSize="small" /><Typography variant="body2"><b>Height:</b> {formData.height} cm</Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Health & Meal</Typography>
                            <Stack spacing={1.2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HealthAndSafety fontSize="small" />
                                <Chip label={`Disease: ${getDiseaseLabel(formData.disease)}`} color="info" size="small" />
                              </Box>
                              <Chip label={`Meal: ${formData.mealCategory}`} color="warning" size="small" />
                              <Chip label={`Preference: ${formData.foodPreference}`}
                                color={formData.foodPreference === 'veg' ? 'success' : 'secondary'} size="small" />
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

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 700 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Button variant="outlined" fullWidth startIcon={<ArrowBack />}
                        onClick={handleBack} disabled={activeStep === 0 || loading} sx={{ py: 1.2, borderRadius: 2 }}>
                        Back
                      </Button>
                    </Grid>
                    {activeStep < 3 ? (
                      <Grid item xs={12} sm={4}>
                        <Button variant="contained" fullWidth
                          endIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <ArrowForward />}
                          onClick={handleNext} disabled={!stepValid(activeStep) || loading} sx={{ py: 1.2, borderRadius: 2 }}>
                          {loading && activeStep === 2 ? 'Generating...' : 'Next'}
                        </Button>
                      </Grid>
                    ) : (
                      <Grid item xs={12} sm={4} />
                    )}
                    <Grid item xs={12} sm={4}>
                      <Button variant="outlined" fullWidth disabled={loading}
                        onClick={() => {
                          setFormData({ age:'', gender:'', weight:'', height:'', disease:'', mealCategory:'', foodPreference:'' });
                          setResult(null); setHasGenerated(false); setActiveStep(0); setPdfSuccess(false);
                        }} sx={{ py: 1.2, borderRadius: 2 }}>
                        Reset
                      </Button>
                    </Grid>
                  </Grid>
                  {activeStep < 3 && !stepValid(activeStep) && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                      Please complete the required fields to continue.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {activeStep === 3 && hasGenerated && result && (
          <Box mt={6}>
            <Typography variant="h4" gutterBottom>🌿 Personalized Results</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Card elevation={4}><CardContent>
                  <Spa color="primary" />
                  <Typography variant="h6">BMI Results</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}><b>Calculated BMI:</b> {result?.user_bmi}</Typography>
                  <Typography variant="body1" component="div">
                    <b>Predicted BMI Category:</b>{' '}
                    <Chip size="small" label={result?.predicted_bmi_category} color="primary" sx={{ ml: 1 }} />
                  </Typography>
                  <Chip label="ML Verified" color="success" sx={{ mt: 1 }} />
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={7}>
                <Card elevation={4}><CardContent>
                  <Favorite color="error" />
                  <Typography variant="h6" sx={{ mt: 1 }}>Food to Avoid</Typography>
                  <Box sx={{ mt: 2 }}>
                    {(result?.foods_to_avoid ? String(result.foods_to_avoid).split(',') : []).map((t, idx) => (
                      <Chip key={idx} label={t.trim()} color="warning" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </CardContent></Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Card elevation={4}><CardContent>
                  <LocalDining color="primary" />
                  <Typography variant="h6" sx={{ mt: 1 }} gutterBottom>Recommended Meal Plan (Complete Meal)</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Dish</strong></TableCell>
                        <TableCell width={100}><strong>Portion %</strong></TableCell>
                        <TableCell width={100}><strong>Amount (g)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(result?.meal_plan ?? []).map((item, i) => {
                        const grams = portionToGrams(item.portion_pct, totalMealGrams);
                        return (
                          <TableRow key={i}>
                            <TableCell>{item?.dish}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>{item?.portion_pct}%</Typography>
                              <LinearProgress variant="determinate"
                                value={Math.min(100, Number(item?.portion_pct) || 0)}
                                sx={{ height: 8, borderRadius: 8 }} />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${grams} g`}
                                size="small"
                                sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.8rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Total row */}
                      <TableRow sx={{ backgroundColor: '#f1f8e9' }}>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell><strong>100%</strong></TableCell>
                        <TableCell>
                          <Chip
                            label={`${totalMealGrams} g`}
                            size="small"
                            sx={{ backgroundColor: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Gram values are BMI-adjusted using your TDEE ({result.predicted_bmi_category} · Mifflin-St Jeor formula).
                    Total meal: <strong>{totalMealGrams}g</strong>. Portion % reflects BMI-adjusted dish distribution.
                  </Typography>
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={5}>
                <Card elevation={4}><CardContent>
                  <Typography variant="h6" gutterBottom>Nutrient Summary</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Chip label={`Calories: ${result?.totals?.calories_kcal ?? '-'} kcal`} />
                    <Chip label={`Protein: ${result?.totals?.protein_g ?? '-'} g`} />
                    <Chip label={`Carbs: ${result?.totals?.carbs_g ?? '-'} g`} />
                    <Chip label={`Fats: ${result?.totals?.fats_g ?? '-'} g`} />
                  </Box>
                </CardContent></Card>
              </Grid>
            </Grid>

            {/* Shad Rasa */}
            <Card elevation={4} sx={{ mt: 3 }}><CardContent>
              <Typography variant="h6" gutterBottom>Ayurvedic Taste Separation (Shad Rasa)</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 220 }}><strong>Taste</strong></TableCell>
                    <TableCell><strong>Dishes (from your meal plan)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ALL_RASAS.map((rasa) => (
                    <TableRow key={rasa}>
                      <TableCell>{rasaLabel(rasa)}</TableCell>
                      <TableCell>
                        {(rasaGrouped?.[rasa] ?? []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        ) : (
                          (rasaGrouped?.[rasa] ?? []).map((x, i) => {
                            const g = portionToGrams(x.portion_pct, totalMealGrams);
                            return (
                              <Chip key={`${rasa}-${i}`} label={`${x.dish} (${x.portion_pct}% · ${g}g)`} sx={{ mr: 1, mb: 1 }} />
                            );
                          })
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Not Defined</TableCell>
                    <TableCell>
                      {(rasaGrouped?.unknown ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      ) : (
                        (rasaGrouped?.unknown ?? []).map((x, i) => {
                          const g = portionToGrams(x.portion_pct, totalMealGrams);
                          return (
                            <Chip key={`unknown-${i}`} label={`${x.dish} (${x.portion_pct}% · ${g}g)`} color="warning" sx={{ mr: 1, mb: 1 }} />
                          );
                        })
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent></Card>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12}>
                {pdfSuccess && (
                  <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ mb: 2, borderRadius: 3, fontWeight: 500 }}>
                    Your Ayurvedic Diet Plan PDF has been downloaded successfully!
                  </Alert>
                )}
                <Button
                  variant="contained" size="large" fullWidth
                  onClick={handleDownloadPDF} disabled={pdfLoading || !result}
                  startIcon={pdfLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : pdfSuccess ? <CheckCircle /> : <Download />}
                  sx={{
                    py: 1.8, borderRadius: 3, fontSize: '1.05rem', fontWeight: 600,
                    background: pdfSuccess ? 'linear-gradient(135deg, #2e7d32, #43a047)' : 'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)',
                    boxShadow: '0 4px 20px rgba(46,125,50,0.35)', letterSpacing: '0.03em', transition: 'all 0.3s ease',
                    '&:hover': { background: 'linear-gradient(135deg, #145214, #1b5e20, #2e7d32)', boxShadow: '0 6px 28px rgba(46,125,50,0.50)', transform: 'translateY(-1px)' },
                    '&:active': { transform: 'translateY(0)' },
                    '&.Mui-disabled': { background: '#bdbdbd', boxShadow: 'none' },
                  }}
                >
                  {pdfLoading ? 'Generating PDF Report…' : pdfSuccess ? 'PDF Downloaded!' : '  Download My Ayurvedic Diet Report (PDF)'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center', opacity: 0.8 }}>
                  Includes: Patient profile · BMI analysis · Meal plan · Nutrient summary · Shad Rasa breakdown · Wellness tips
                </Typography>
              </Grid>
            </Grid>

          </Box>
        )}
      </Paper>
    </Container>
  );
}