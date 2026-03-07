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

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const T = {
  leaf:      '#22543d',
  leafMid:   '#276749',
  sage:      '#48bb78',
  sagePale:  '#c6f6d5',
  gold:      '#b7791f',
  goldPale:  '#fefcbf',
  cream:     '#fffff0',
  parchment: '#faf7f0',
  bark:      '#744210',
  inkDark:   '#1a202c',
  inkMid:    '#2d3748',
  inkLight:  '#718096',
  border:    '#e2e8f0',
  borderGreen: '#9ae6b4',
  white:     '#ffffff',
  redSoft:   '#fc8181',
  redPale:   '#fff5f5',
};

// ─── SHARED SX HELPERS ────────────────────────────────────────────────────────
const cardBase = {
  borderRadius: 3,
  border: `1px solid ${T.borderGreen}`,
  background: `linear-gradient(160deg, ${T.white} 0%, ${T.parchment} 100%)`,
  boxShadow: '0 2px 16px rgba(34,84,61,0.08)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease',
  '&:hover': { boxShadow: '0 6px 28px rgba(34,84,61,0.14)' },
};

const sectionLabelSx = {
  display: 'inline-flex', alignItems: 'center', gap: 1,
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: T.leafMid,
  mb: 1.5,
};

const accentBar = (color = T.leaf) => ({
  content: '""', display: 'block',
  width: 36, height: 3, borderRadius: 2,
  background: color, mt: 0.5, mb: 2,
});

// ─── BMI-ADJUSTED GRAM CALCULATION ───────────────────────────────────────────
function calcBMIAdjustedMealGrams({ age, gender, weight_kg, height_cm, bmiCategory, mealCategory, mealCalories }) {
  let bmr;
  if ((gender || '').toLowerCase() === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
  const tdee = bmr * 1.2;
  const adjustments = { underweight: 1.15, normal: 1.0, overweight: 0.90, obese: 0.80 };
  const adj = adjustments[(bmiCategory || 'normal').toLowerCase()] ?? 1.0;
  const adjustedTDEE = tdee * adj;
  const mealFractions = { breakfast: 0.25, lunch: 0.35, dinner: 0.30 };
  const fraction = mealFractions[(mealCategory || 'lunch').toLowerCase()] ?? 0.30;
  const mealCalorieBudget = adjustedTDEE * fraction;
  const REF_GRAMS = 500;
  const kcalPerGram = (mealCalories > 0) ? (mealCalories / REF_GRAMS) : 1.0;
  const totalGrams = Math.round(mealCalorieBudget / kcalPerGram);
  return Math.min(Math.max(totalGrams, 150), 1200);
}

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

  const PAGE_W = 210, PAGE_H = 297, MARGIN = 16, CONTENT_W = PAGE_W - MARGIN * 2;

  const C = {
    leaf:[34,85,60], sage:[72,163,110], gold:[196,145,20],
    cream:[254,250,224], bark:[100,60,30], mist:[200,235,215],
    white:[255,255,255], ink:[28,28,28], fog:[246,243,232],
    red:[190,50,50], amber:[200,130,0],
  };

  const setFill = (rgb) => doc.setFillColor(...rgb);
  const setDraw = (rgb) => doc.setDrawColor(...rgb);
  const setTxt  = (rgb) => doc.setTextColor(...rgb);
  const setFont = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };
  const fillRRect = (x,y,w,h,r,color) => { setFill(color); doc.roundedRect(x,y,w,h,r,r,'F'); };
  const centerText = (text,y,color,style='normal',size=10) => { setFont(style,size); setTxt(color); doc.text(String(text),PAGE_W/2,y,{align:'center'}); };
  const labelValue = (label,value,x,y,lc,vc) => { setFont('bold',9); setTxt(lc); doc.text(label+':',x,y); setFont('normal',9); setTxt(vc); doc.text(String(value),x+36,y); return y+7; };
  const sectionHeader = (title,y,color=C.leaf) => { fillRRect(MARGIN,y,CONTENT_W,9,2,color); setFont('bold',9); setTxt(C.white); doc.text(title.toUpperCase(),MARGIN+4,y+6); return y+14; };
  const rule = (y,color=C.mist) => { setDraw(color); doc.setLineWidth(0.3); doc.line(MARGIN,y,PAGE_W-MARGIN,y); return y+4; };
  const macroBar = (label,value,unit,max,barColor,x,y,barW) => {
    setFont('normal',8); setTxt(C.ink); doc.text(`${label}: ${value}${unit}`,x,y);
    setFill(C.mist); doc.roundedRect(x,y+2,barW,3.5,1,1,'F');
    setFill(barColor); doc.roundedRect(x,y+2,Math.max(1,Math.min((value/max)*barW,barW)),3.5,1,1,'F');
    return y+12;
  };

  // PAGE 1
  fillRRect(0,0,PAGE_W,PAGE_H,0,C.fog);
  setFill(C.leaf); doc.rect(0,0,5,PAGE_H,'F');
  setFill(C.gold); doc.rect(5,0,PAGE_W-5,2.5,'F');
  fillRRect(MARGIN,8,CONTENT_W,44,4,C.leaf);
  setFill(C.gold); doc.rect(MARGIN,8,CONTENT_W,3,'F');
  centerText('Ayurvedic Diet Plan Report',22,C.cream,'bold',18);
  centerText('Personalised Wellness · Rooted in Ancient Wisdom',30,C.mist,'italic',9);
  const genDate = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  centerText(`Generated on ${genDate}`,40,C.mist,'normal',8);
  centerText('Developed by Dias W A N M (IT22899910)',46,C.cream,'normal',7);

  let y = 62;
  y = sectionHeader('Patient Profile',y);
  const col1=MARGIN+4, col2=PAGE_W/2+4;
  const profileLeft=[['Age',`${formData.age} years`],['Gender',formData.gender?formData.gender.charAt(0).toUpperCase()+formData.gender.slice(1):'—'],['Weight',`${formData.weight} kg`],['Height',`${formData.height} cm`]];
  const profileRight=[['BMI',`${result.user_bmi} kg/m2`],['Category',result.predicted_bmi_category?result.predicted_bmi_category.charAt(0).toUpperCase()+result.predicted_bmi_category.slice(1):'—'],['Condition',result.disease?result.disease.charAt(0).toUpperCase()+result.disease.slice(1):'—'],['Diet Type',result.diet_preference?result.diet_preference.charAt(0).toUpperCase()+result.diet_preference.slice(1):'—']];
  const startY=y; let y2=startY;
  profileLeft.forEach(([l,v])=>{y=labelValue(l,v,col1,y,C.bark,C.ink);});
  profileRight.forEach(([l,v])=>{y2=labelValue(l,v,col2,y2,C.bark,C.ink);});
  y=Math.max(y,y2)+4; y=rule(y);

  const bmiCat=(result.predicted_bmi_category||'').toLowerCase();
  const bmiColor=bmiCat==='normal'?C.sage:bmiCat==='underweight'?C.amber:bmiCat==='overweight'?C.amber:C.red;
  fillRRect(MARGIN,y,CONTENT_W,12,3,bmiColor);
  setFont('bold',9); setTxt(C.white);
  doc.text(`BMI: ${result.user_bmi}  ·  ${(result.predicted_bmi_category||'').toUpperCase()}  ·  ML Verified`,PAGE_W/2,y+7.5,{align:'center'});
  y+=17;

  y=sectionHeader('Meal Session Details',y,C.sage);
  [['Meal Category',result.meal_category?result.meal_category.charAt(0).toUpperCase()+result.meal_category.slice(1):'—'],['Diet Preference',result.diet_preference?result.diet_preference.charAt(0).toUpperCase()+result.diet_preference.slice(1):'—'],['Health Condition',result.disease?result.disease.charAt(0).toUpperCase()+result.disease.slice(1):'—']].forEach(([l,v])=>{y=labelValue(l,v,col1,y,C.bark,C.ink);});
  y=rule(y+2);

  y=sectionHeader('Recommended Meal Plan',y);
  const COL_NUM=MARGIN+3, COL_DISH=MARGIN+12, COL_PCT=MARGIN+CONTENT_W-68, COL_GRAMS=MARGIN+CONTENT_W-54, COL_BAR_X=MARGIN+CONTENT_W-42, COL_BAR_W=34, DISH_MAX=COL_PCT-COL_DISH-4;
  fillRRect(MARGIN,y-5,CONTENT_W,9,1,C.mist);
  setFont('bold',8); setTxt(C.leaf);
  doc.text('#',COL_NUM,y); doc.text('Dish',COL_DISH,y); doc.text('Portion',COL_PCT,y); doc.text('Grams',COL_GRAMS,y); doc.text('Bar',COL_BAR_X+COL_BAR_W/2,y,{align:'center'});
  y+=5;

  (result.meal_plan||[]).forEach((item,i)=>{
    const dishLines=doc.splitTextToSize(String(item.dish||''),DISH_MAX);
    const ROW_H=Math.max(12,dishLines.length*5+6), rowY=y;
    const grams=portionToGrams(item.portion_pct,totalMealGrams);
    if(i%2===0){setFill([245,250,246]); doc.rect(MARGIN,rowY-3,CONTENT_W,ROW_H,'F');}
    setFont('normal',8); setTxt(C.ink);
    doc.text(String(i+1),COL_NUM,rowY+2); doc.text(dishLines,COL_DISH,rowY+2);
    const midY=rowY+ROW_H/2;
    setFont('bold',8); setTxt(C.leaf); doc.text(`${item.portion_pct}%`,COL_PCT,midY+1);
    fillRRect(COL_GRAMS-1,midY-3.5,14,6,1.5,C.mist);
    setFont('bold',7.5); setTxt(C.leaf); doc.text(`${grams}g`,COL_GRAMS+6,midY+0.5,{align:'center'});
    setFill(C.mist); doc.roundedRect(COL_BAR_X,midY-2.5,COL_BAR_W,4,1,1,'F');
    setFill(C.sage); doc.roundedRect(COL_BAR_X,midY-2.5,Math.max(1,(item.portion_pct/100)*COL_BAR_W),4,1,1,'F');
    y+=ROW_H;
  });

  fillRRect(MARGIN,y,CONTENT_W,8,1,C.mist);
  setFont('bold',8); setTxt(C.leaf); doc.text('Total Meal Weight:',COL_DISH,y+5.5);
  setFont('bold',8); setTxt(C.bark); doc.text(`${totalMealGrams} g`,COL_GRAMS,y+5.5);
  y+=12;
  setFont('italic',7); setTxt([120,120,120]);
  doc.text(`Gram values are BMI-adjusted using your TDEE (${result.predicted_bmi_category} · Mifflin-St Jeor).`,MARGIN+2,y);
  y+=7; y=rule(y);

  y=sectionHeader('Nutrition Summary',y,C.bark);
  const totals=result.totals||{}, boxW=(CONTENT_W-9)/4;
  [{label:'Calories',value:totals.calories_kcal,unit:'kcal',color:C.red},{label:'Protein',value:totals.protein_g,unit:'g',color:C.sage},{label:'Carbs',value:totals.carbs_g,unit:'g',color:C.gold},{label:'Fats',value:totals.fats_g,unit:'g',color:C.bark}].forEach((item,i)=>{
    const bx=MARGIN+i*(boxW+3);
    fillRRect(bx,y,boxW,20,3,C.white); setDraw(item.color); doc.setLineWidth(0.6); doc.roundedRect(bx,y,boxW,20,3,3,'S');
    setFont('bold',11); setTxt(item.color); doc.text(String(item.value??'—'),bx+boxW/2,y+10,{align:'center'});
    setFont('normal',7); setTxt(C.bark); doc.text(`${item.unit}  ${item.label}`,bx+boxW/2,y+17,{align:'center'});
  });
  y+=26;
  const halfW=(CONTENT_W-10)/2, leftX=MARGIN, rightX=MARGIN+halfW+10;
  macroBar('Protein',totals.protein_g,'g',50,C.sage,leftX,y,halfW);
  macroBar('Carbs',totals.carbs_g,'g',200,C.gold,rightX,y,halfW); y+=12;
  macroBar('Calories',totals.calories_kcal,'kcal',2500,C.red,leftX,y,halfW);
  macroBar('Fats',totals.fats_g,'g',70,C.bark,rightX,y,halfW); y+=14;
  y=rule(y);

  y=sectionHeader('Foods to Avoid',y,C.red);
  const avoidItems=(result.foods_to_avoid?String(result.foods_to_avoid).split(','):[]).map(s=>s.trim()).filter(Boolean);
  const CHIP_H=7,CHIP_PAD=4,CHIP_GAP=3,PAGE_BOTTOM=PAGE_H-20;
  let chipX=MARGIN+2,chipY=y;
  setFont('normal',7.5);
  avoidItems.forEach(food=>{
    const chipW=doc.getTextWidth(food)+CHIP_PAD*2;
    if(chipX+chipW>PAGE_W-MARGIN){chipX=MARGIN+2; chipY+=CHIP_H+3;}
    if(chipY+CHIP_H>PAGE_BOTTOM) return;
    fillRRect(chipX,chipY-5,chipW,CHIP_H,1.5,[255,230,220]); setTxt(C.red); doc.text(food,chipX+CHIP_PAD,chipY); chipX+=chipW+CHIP_GAP;
  });
  y=chipY+CHIP_H+2; y=rule(y);

  // PAGE 2
  doc.addPage();
  fillRRect(0,0,PAGE_W,PAGE_H,0,C.fog);
  setFill(C.leaf); doc.rect(0,0,5,PAGE_H,'F');
  setFill(C.gold); doc.rect(5,0,PAGE_W-5,2.5,'F');
  fillRRect(MARGIN,8,CONTENT_W,20,4,C.leaf);
  centerText('Ayurvedic Taste Separation — Shad Rasa',16,C.cream,'bold',13);
  centerText('The six tastes and their presence in your meal plan',22,C.mist,'italic',8);
  y=36;
  const ALL_RASAS_P2=['sweet','sour','salty','pungent','bitter','astringent'];
  const rasaLabels={sweet:'Sweet (Madhura)',sour:'Sour (Amla)',salty:'Salty (Lavana)',pungent:'Pungent (Katu)',bitter:'Bitter (Tikta)',astringent:'Astringent (Kashaya)'};
  const rasaColors={sweet:[220,170,50],sour:[190,100,40],salty:[60,130,190],pungent:[190,60,60],bitter:[60,140,80],astringent:[120,80,160]};
  ALL_RASAS_P2.forEach(rasa=>{
    const items=rasaGrouped?.[rasa]??[], rowH=Math.max(14,6+items.length*7), col=rasaColors[rasa];
    setFill([245,248,246]); doc.roundedRect(MARGIN,y,CONTENT_W,rowH,2,2,'F');
    setFill(col); doc.roundedRect(MARGIN,y,5,rowH,1,1,'F');
    setFont('bold',9); setTxt(col); doc.text(rasaLabels[rasa],MARGIN+9,y+8);
    if(items.length===0){setFont('italic',8); setTxt([160,160,160]); doc.text('No dishes from your meal plan',MARGIN+70,y+8);}
    else{items.forEach((item,idx)=>{const g=portionToGrams(item.portion_pct,totalMealGrams); setFont('normal',8); setTxt(C.ink); doc.text(`• ${item.dish}  (${item.portion_pct}% · ${g}g)`,MARGIN+70,y+8+idx*7);});}
    setDraw(C.mist); doc.setLineWidth(0.2); doc.line(MARGIN,y+rowH,PAGE_W-MARGIN,y+rowH); y+=rowH+3;
  });
  const unknown=rasaGrouped?.unknown??[];
  if(unknown.length>0){
    const rowH=Math.max(14,6+unknown.length*7);
    fillRRect(MARGIN,y,CONTENT_W,rowH,2,[250,240,220]);
    setFill(C.amber); doc.roundedRect(MARGIN,y,5,rowH,1,1,'F');
    setFont('bold',9); setTxt(C.amber); doc.text('Not Defined',MARGIN+9,y+8);
    unknown.forEach((item,idx)=>{const g=portionToGrams(item.portion_pct,totalMealGrams); setFont('normal',8); setTxt(C.ink); doc.text(`• ${item.dish}  (${item.portion_pct}% · ${g}g)`,MARGIN+70,y+8+idx*7);});
    y+=rowH+3;
  }
  y=rule(y+4);
  y=sectionHeader('Ayurvedic Wellness Tips',y,C.sage);
  const diseaseTips={diabetes:['Prefer bitter & astringent tastes to balance blood sugar.','Eat at fixed times daily — erratic meals disturb Vata.','Avoid heavy dinners after 7 PM.'],hypertension:['Reduce salt & pungent foods to calm Pitta.','Include cooling herbs like coriander and fennel.','Practice mindful, slow eating.'],obesity:['Favour warm, light meals to kindle Agni (digestive fire).','Eat only when genuinely hungry.','Include digestive spices: ginger, cumin, black pepper.'],migraine:['Avoid fermented, aged, and sour foods.','Stay hydrated with warm water and herbal teas.','Maintain a consistent sleep-wake schedule.'],arthritis:['Favour warm, cooked foods over raw and cold.','Include anti-inflammatory spices: turmeric, ginger.','Avoid nightshades (tomato, potato, pepper) when possible.'],gastritis:['Eat small, frequent meals — avoid skipping.','Choose cooling, soothing foods: coconut, coriander.','Avoid spicy, fried, and very sour foods.']};
  const tips=diseaseTips[(result.disease||'').toLowerCase()]||['Follow seasonal eating aligned with your local climate.','Chew food thoroughly — digestion begins in the mouth.','Drink warm water with meals; avoid cold beverages.'];
  tips.forEach(tip=>{
    setFill(C.sage); doc.circle(MARGIN+4,y-1.5,1.5,'F');
    setFont('normal',9); setTxt(C.ink);
    const lines=doc.splitTextToSize(tip,CONTENT_W-14); doc.text(lines,MARGIN+10,y); y+=lines.length*5.5+3;
  });
  y=rule(y+2);
  fillRRect(MARGIN,PAGE_H-14,CONTENT_W,10,3,C.leaf);
  setFont('normal',7); setTxt(C.mist);
  doc.text('This report is for wellness guidance only. Consult a qualified Ayurvedic physician before making dietary changes.',PAGE_W/2,PAGE_H-7,{align:'center'});
  doc.save(`AyurvedicDietPlan_${formData.gender||'user'}_${Date.now()}.pdf`);
}

// ─── RASA COLOUR MAP (UI) ─────────────────────────────────────────────────────
const RASA_UI_COLOR = {
  sweet:      { bg: '#fffbeb', border: '#f6e05e', dot: '#d69e2e', text: '#744210' },
  sour:       { bg: '#fff5f5', border: '#fc8181', dot: '#e53e3e', text: '#742a2a' },
  salty:      { bg: '#ebf8ff', border: '#63b3ed', dot: '#3182ce', text: '#2a4365' },
  pungent:    { bg: '#fff5f5', border: '#feb2b2', dot: '#e53e3e', text: '#742a2a' },
  bitter:     { bg: '#f0fff4', border: '#68d391', dot: '#38a169', text: '#22543d' },
  astringent: { bg: '#faf5ff', border: '#d6bcfa', dot: '#805ad5', text: '#44337a' },
};

// ─── RESULT SECTION COMPONENTS ───────────────────────────────────────────────

/** Decorative section heading used within result cards */
function ResultSectionLabel({ icon, children }) {
  return (
    <Box sx={sectionLabelSx}>
      {icon && <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</Box>}
      {children}
    </Box>
  );
}

/** Stat pill used in the nutrient summary */
function NutrientPill({ label, value, unit, color }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 2, py: 1.2,
      borderRadius: 2,
      background: T.white,
      border: `1px solid ${T.border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.82rem', color: T.inkMid, fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: T.inkDark }}>{value ?? '—'}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: T.inkLight }}>{unit}</Typography>
      </Box>
    </Box>
  );
}

/** Single macro bar row */
function MacroRow({ label, value, unit, max, color }) {
  const pct = Math.min(100, Math.round(((value ?? 0) / max) * 100));
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
        <Typography sx={{ fontSize: '0.75rem', color: T.inkLight, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: T.inkMid, fontWeight: 600 }}>{value ?? '—'} {unit}</Typography>
      </Box>
      <Box sx={{ height: 6, borderRadius: 99, background: T.border, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.8s ease' }} />
      </Box>
    </Box>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function DietPage() {
  const steps = ['Personal & Measurements', 'Health Information', 'Meal Preferences', 'Review & Results'];
  const [activeStep, setActiveStep] = useState(0);
  const fieldSx = { minWidth: 220, '& .MuiOutlinedInput-root': { height: 56 } };

  const [formData, setFormData] = useState({ age:'', gender:'', weight:'', height:'', disease:'', mealCategory:'', foodPreference:'' });
  const [result, setResult]             = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [metadata, setMetadata]         = useState(null);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [pdfSuccess, setPdfSuccess]     = useState(false);

  useEffect(() => { loadMetadata(); }, []);
  const loadMetadata = async () => {
    try { const r = await fetch('/api/diet/metadata'); setMetadata(await r.json()); }
    catch(err) { console.error('Failed to load metadata:', err); }
  };

  const diseaseOptions = useMemo(() => {
    if (metadata?.diseases) return metadata.diseases.map(d => ({ value:d, label:d.charAt(0).toUpperCase()+d.slice(1) }));
    return [{value:'diabetes',label:'Diabetes'},{value:'migraine',label:'Migraine'},{value:'arthritis',label:'Arthritis'},{value:'asthma',label:'Asthma'},{value:'gastritis',label:'Gastritis'}];
  }, [metadata]);

  const getDiseaseLabel = v => diseaseOptions.find(d => d.value === v)?.label || v;

  const [tasteMap, setTasteMap] = useState(null);
  const ALL_RASAS = useMemo(() => ['sweet','sour','salty','pungent','bitter','astringent'], []);

  const rasaLabel = key => ({ sweet:'Sweet (Madhura)',sour:'Sour (Amla)',salty:'Salty (Lavana)',pungent:'Pungent (Katu)',bitter:'Bitter (Tikta)',astringent:'Astringent (Kashaya)' }[key] || key);
  const norm = s => String(s||'').toLowerCase().trim().replace(/\s+/g,' ');
  const tasteToKey = t => {
    const x = String(t||'').toLowerCase();
    if(x.includes('sweet')) return 'sweet'; if(x.includes('sour')) return 'sour';
    if(x.includes('salty')) return 'salty'; if(x.includes('pungent')) return 'pungent';
    if(x.includes('bitter')) return 'bitter'; if(x.includes('astringent')) return 'astringent';
    return 'astringent';
  };

  useEffect(() => {
    fetch('/ayurvedic_food_tastes.csv').then(r=>r.text()).then(csvText=>{
      const parsed = Papa.parse(csvText,{header:true,skipEmptyLines:true});
      const map = new Map();
      (parsed.data||[]).forEach(row=>{ const dish=norm(row?.Food); const k=tasteToKey(row?.Ayurvedic_Taste); if(dish) map.set(dish,k); });
      setTasteMap(map);
    }).catch(()=>setTasteMap(new Map()));
  }, []);

  const rasaGrouped = useMemo(() => {
    const g={sweet:[],sour:[],salty:[],pungent:[],bitter:[],astringent:[],unknown:[]};
    if(!result?.meal_plan) return g;
    (result.meal_plan||[]).forEach(item=>{ const k=tasteMap?.get(norm(item?.dish)); if(!tasteMap||!k) g.unknown.push(item); else g[k].push(item); });
    return g;
  }, [tasteMap, result]);

  const totalMealGrams = useMemo(() => {
    if(!result) return 500;
    return calcBMIAdjustedMealGrams({
      age: parseFloat(formData.age)||25, gender: formData.gender||'female',
      weight_kg: parseFloat(formData.weight)||60, height_cm: parseFloat(formData.height)||165,
      bmiCategory: result.predicted_bmi_category||'normal',
      mealCategory: result.meal_category||'lunch',
      mealCalories: result.totals?.calories_kcal||500,
    });
  }, [result, formData]);

  const handleChange = e => { setHasGenerated(false); setResult(null); setError(null); setPdfSuccess(false); setFormData({...formData,[e.target.name]:e.target.value}); };
  const stepValid = step => {
    if(step===0) return !!formData.age&&!!formData.gender&&!!formData.weight&&!!formData.height;
    if(step===1) return !!formData.disease;
    if(step===2) return !!formData.mealCategory&&!!formData.foodPreference;
    return true;
  };

  const handleGenerate = async e => {
    if(e?.preventDefault) e.preventDefault();
    setLoading(true); setError(null); setPdfSuccess(false);
    try {
      const payload={age:parseInt(formData.age),gender:formData.gender.toLowerCase(),weight_kg:parseFloat(formData.weight),height_cm:parseFloat(formData.height),disease:formData.disease.toLowerCase(),meal_category:formData.mealCategory.toLowerCase(),diet_preference:formData.foodPreference.toLowerCase()};
      const response = await fetch('/api/diet/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data = await response.json();
      if(data.success){
        setResult({
          user_bmi:data.user_info.bmi, predicted_bmi_category:data.user_info.bmi_category,
          meal_category:data.meal_info.meal_category, diet_preference:data.meal_info.diet_preference,
          disease:data.meal_info.disease, foods_to_avoid:data.foods_to_avoid,
          meal_plan:data.meal_plan.map(dish=>({dish:dish.dish,portion_pct:dish.portion_percent})),
          totals:{calories_kcal:data.nutrition.total_calories_kcal,protein_g:data.nutrition.protein_g,carbs_g:data.nutrition.carbs_g,fats_g:data.nutrition.fats_g}
        });
        setHasGenerated(true);
      } else { setError(data.error||'Failed to generate meal plan'); }
    } catch(err) { setError('Failed to connect to diet planning service. Make sure Flask API is running on port 5001.'); }
    finally { setLoading(false); }
  };

  const handleNext = () => { if(!stepValid(activeStep)) return; if(activeStep===2) handleGenerate({preventDefault:()=>{}}); setActiveStep(s=>Math.min(s+1,steps.length-1)); };
  const handleBack = () => { setHasGenerated(false); setResult(null); setPdfSuccess(false); setActiveStep(s=>Math.max(s-1,0)); };
  const handleDownloadPDF = async () => {
    if(!result) return;
    setPdfLoading(true); setPdfSuccess(false);
    try { await downloadDietPDF(result,formData,rasaGrouped,totalMealGrams); setPdfSuccess(true); setTimeout(()=>setPdfSuccess(false),4000); }
    catch(err) { console.error('PDF generation failed:',err); setError('Could not generate PDF. Please try again.'); }
    finally { setPdfLoading(false); }
  };

  // BMI badge colour
  const bmiCat = (result?.predicted_bmi_category||'').toLowerCase();
  const bmiChipColor = bmiCat==='normal' ? { bg:'#f0fff4', border:'#68d391', text:'#22543d' }
    : bmiCat==='underweight' ? { bg:'#fffbeb', border:'#f6e05e', text:'#744210' }
    : bmiCat==='overweight'  ? { bg:'#fff7ed', border:'#fbd38d', text:'#7b341e' }
    : { bg:'#fff5f5', border:'#fc8181', text:'#742a2a' };

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
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          <Typography variant="caption" color="text.secondary" sx={{ mt:1, display:'block', textAlign:'center' }}>
            Fill step-by-step to generate a personalized meal plan.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb:3 }} onClose={()=>setError(null)}>{error}</Alert>}

        <Box component="form" onSubmit={handleGenerate}>
          <Grid container spacing={4}>

            {activeStep===0 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius:3, backgroundColor:'#e8f5e9', '&:hover':{boxShadow:10} }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🧍 Personal & Measurements</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}><TextField fullWidth name="age" label="Age (years)" type="number" InputLabelProps={{shrink:true}} inputProps={{min:1,max:120}} onChange={handleChange} value={formData.age} required sx={fieldSx}/></Grid>
                      <Grid item xs={12} sm={6} md={3}><TextField select fullWidth name="gender" label="Gender" InputLabelProps={{shrink:true}} onChange={handleChange} value={formData.gender} required sx={fieldSx}><MenuItem value="male">Male</MenuItem><MenuItem value="female">Female</MenuItem></TextField></Grid>
                      <Grid item xs={12} sm={6} md={3}><TextField fullWidth name="weight" label="Weight (kg)" type="number" InputLabelProps={{shrink:true}} inputProps={{min:1,max:250,step:0.1}} onChange={handleChange} value={formData.weight} required sx={fieldSx}/></Grid>
                      <Grid item xs={12} sm={6} md={3}><TextField fullWidth name="height" label="Height (cm)" type="number" InputLabelProps={{shrink:true}} inputProps={{min:50,max:250}} onChange={handleChange} value={formData.height} required sx={fieldSx}/></Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{mt:2,display:'block'}}>BMI will be calculated automatically after generating the meal plan.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep===1 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius:3, backgroundColor:'#e3f2fd', '&:hover':{boxShadow:10} }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🩺 Health Information</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}><TextField select fullWidth name="disease" label="Disease" InputLabelProps={{shrink:true}} onChange={handleChange} value={formData.disease} required sx={fieldSx}>{diseaseOptions.map(d=><MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}</TextField></Grid>
                      <Grid item xs={12} md={6}><Alert severity="info" sx={{height:56,display:'flex',alignItems:'center',borderRadius:2}}>Foods to avoid will be generated based on your disease.</Alert></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep===2 && (
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius:3, backgroundColor:'#fff3e0', '&:hover':{boxShadow:10} }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🍽️ Meal Preferences</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}><TextField select fullWidth name="mealCategory" label="Meal Category" InputLabelProps={{shrink:true}} onChange={handleChange} value={formData.mealCategory} required sx={fieldSx}><MenuItem value="breakfast">Breakfast</MenuItem><MenuItem value="lunch">Lunch</MenuItem><MenuItem value="dinner">Dinner</MenuItem></TextField></Grid>
                      <Grid item xs={12} md={4}><TextField select fullWidth name="foodPreference" label="Food Preference" InputLabelProps={{shrink:true}} onChange={handleChange} value={formData.foodPreference} required sx={fieldSx}><MenuItem value="veg">Vegetarian</MenuItem><MenuItem value="non-veg">Non-Vegetarian</MenuItem></TextField></Grid>
                      <Grid item xs={12} md={4}><Alert severity="success" sx={{height:56,display:'flex',alignItems:'center',borderRadius:2}}>Output: Full meal + Portion % + Nutrients</Alert></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {activeStep===3 && (
              <Grid item xs={12}>
                {/* Outer card — matches result card aesthetic */}
                <Box sx={{
                  borderRadius: 3,
                  border: `1px solid ${T.borderGreen}`,
                  background: `linear-gradient(160deg, ${T.white} 0%, ${T.parchment} 100%)`,
                  boxShadow: '0 2px 16px rgba(34,84,61,0.08)',
                  overflow: 'hidden',
                }}>
                  {/* Top accent stripe */}
                  <Box sx={{ height: 5, background: `linear-gradient(90deg, ${T.leaf}, ${T.sage}, ${T.gold})` }}/>

                  <Box sx={{ p: 3 }}>
                    {/* Heading */}
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb: 3 }}>
                      <Box sx={{ width:4, height:24, borderRadius:2, background:`linear-gradient(180deg, ${T.leaf}, ${T.sage})` }}/>
                      <Typography sx={{ fontSize:'1rem', fontWeight:700, color:T.inkDark, letterSpacing:'-0.01em' }}>
                        Review Your Inputs
                      </Typography>
                      <Box sx={{ ml:'auto', px:1.5, py:0.4, borderRadius:99, background:T.sagePale, border:`1px solid ${T.borderGreen}` }}>
                        <Typography sx={{ fontSize:'0.7rem', fontWeight:700, color:T.leaf, letterSpacing:'0.08em', textTransform:'uppercase' }}>Step 4 of 4</Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      {/* ── Personal Info Panel ── */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{
                          borderRadius: 2.5,
                          border: `1px solid ${T.borderGreen}`,
                          background: T.white,
                          overflow: 'hidden',
                          height: '100%',
                        }}>
                          {/* Panel header */}
                          <Box sx={{ px:2, py:1.2, background:T.sagePale, borderBottom:`1px solid ${T.borderGreen}`, display:'flex', alignItems:'center', gap:1 }}>
                            <Person sx={{ fontSize:'0.95rem', color:T.leaf }}/>
                            <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color:T.leafMid, textTransform:'uppercase', letterSpacing:'0.1em' }}>Personal</Typography>
                          </Box>

                          {/* Rows */}
                          {[
                            { icon:<Person sx={{fontSize:'0.9rem',color:T.inkLight}}/>,  label:'Age',    value:`${formData.age} years` },
                            { icon:<Person sx={{fontSize:'0.9rem',color:T.inkLight}}/>,  label:'Gender', value: formData.gender ? formData.gender.charAt(0).toUpperCase()+formData.gender.slice(1) : '—' },
                            { icon:<MonitorWeight sx={{fontSize:'0.9rem',color:T.inkLight}}/>, label:'Weight', value:`${formData.weight} kg` },
                            { icon:<Height sx={{fontSize:'0.9rem',color:T.inkLight}}/>,  label:'Height', value:`${formData.height} cm` },
                          ].map((row, i, arr) => (
                            <Box key={row.label} sx={{
                              display:'flex', alignItems:'center', justifyContent:'space-between',
                              px:2, py:1.1,
                              borderBottom: i < arr.length-1 ? `1px solid ${T.border}` : 'none',
                            }}>
                              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                {row.icon}
                                <Typography sx={{ fontSize:'0.8rem', color:T.inkLight }}>{row.label}</Typography>
                              </Box>
                              <Typography sx={{ fontSize:'0.85rem', fontWeight:600, color:T.inkDark }}>{row.value || '—'}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Grid>

                      {/* ── Health & Meal Panel ── */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{
                          borderRadius: 2.5,
                          border: `1px solid ${T.borderGreen}`,
                          background: T.white,
                          overflow: 'hidden',
                          height: '100%',
                        }}>
                          {/* Panel header */}
                          <Box sx={{ px:2, py:1.2, background:T.sagePale, borderBottom:`1px solid ${T.borderGreen}`, display:'flex', alignItems:'center', gap:1 }}>
                            <HealthAndSafety sx={{ fontSize:'0.95rem', color:T.leaf }}/>
                            <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color:T.leafMid, textTransform:'uppercase', letterSpacing:'0.1em' }}>Health & Meal</Typography>
                          </Box>

                          {/* Disease row */}
                          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1.1, borderBottom:`1px solid ${T.border}` }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <HealthAndSafety sx={{ fontSize:'0.9rem', color:T.inkLight }}/>
                              <Typography sx={{ fontSize:'0.8rem', color:T.inkLight }}>Condition</Typography>
                            </Box>
                            <Box sx={{ px:1.4, py:0.35, borderRadius:99, background:'#ebf8ff', border:'1px solid #63b3ed' }}>
                              <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#2b6cb0' }}>{getDiseaseLabel(formData.disease) || '—'}</Typography>
                            </Box>
                          </Box>

                          {/* Meal category row */}
                          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1.1, borderBottom:`1px solid ${T.border}` }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <LocalDining sx={{ fontSize:'0.9rem', color:T.inkLight }}/>
                              <Typography sx={{ fontSize:'0.8rem', color:T.inkLight }}>Meal</Typography>
                            </Box>
                            <Box sx={{ px:1.4, py:0.35, borderRadius:99, background:T.goldPale, border:`1px solid #ecc94b` }}>
                              <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.bark }}>
                                {formData.mealCategory ? formData.mealCategory.charAt(0).toUpperCase()+formData.mealCategory.slice(1) : '—'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Preference row */}
                          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1.1 }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <Spa sx={{ fontSize:'0.9rem', color:T.inkLight }}/>
                              <Typography sx={{ fontSize:'0.8rem', color:T.inkLight }}>Preference</Typography>
                            </Box>
                            <Box sx={{
                              px:1.4, py:0.35, borderRadius:99,
                              background: formData.foodPreference==='veg' ? T.sagePale : '#faf5ff',
                              border: `1px solid ${formData.foodPreference==='veg' ? T.borderGreen : '#d6bcfa'}`,
                            }}>
                              <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color: formData.foodPreference==='veg' ? T.leaf : '#553c9a' }}>
                                {formData.foodPreference==='veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Footer note */}
                    <Box sx={{ mt:2.5, display:'flex', alignItems:'center', gap:1, px:0.5 }}>
                      <Box sx={{ width:6, height:6, borderRadius:'50%', background:T.sage, flexShrink:0 }}/>
                      <Typography sx={{ fontSize:'0.75rem', color:T.inkLight }}>
                        Your personalized Ayurvedic meal plan will be generated automatically based on these inputs.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display:'flex', justifyContent:'center', mt:2 }}>
                <Box sx={{ width:'100%', maxWidth:700 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><Button variant="outlined" fullWidth startIcon={<ArrowBack/>} onClick={handleBack} disabled={activeStep===0||loading} sx={{py:1.2,borderRadius:2}}>Back</Button></Grid>
                    {activeStep<3 ? (
                      <Grid item xs={12} sm={4}><Button variant="contained" fullWidth endIcon={loading?<CircularProgress size={20} sx={{color:'white'}}/>:<ArrowForward/>} onClick={handleNext} disabled={!stepValid(activeStep)||loading} sx={{py:1.2,borderRadius:2}}>{loading&&activeStep===2?'Generating...':'Next'}</Button></Grid>
                    ) : <Grid item xs={12} sm={4}/>}
                    <Grid item xs={12} sm={4}><Button variant="outlined" fullWidth disabled={loading} onClick={()=>{ setFormData({age:'',gender:'',weight:'',height:'',disease:'',mealCategory:'',foodPreference:''}); setResult(null); setHasGenerated(false); setActiveStep(0); setPdfSuccess(false); }} sx={{py:1.2,borderRadius:2}}>Reset</Button></Grid>
                  </Grid>
                  {activeStep<3&&!stepValid(activeStep)&&<Typography variant="caption" color="error" sx={{mt:1,display:'block',textAlign:'center'}}>Please complete the required fields to continue.</Typography>}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── RESULTS ─────────────────────────────────────────────────────── */}
        {activeStep===3 && hasGenerated && result && (
          <Box mt={6}>

            {/* Section heading */}
            <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:3 }}>
              <Box sx={{ width:4, height:32, borderRadius:2, background:`linear-gradient(180deg, ${T.leaf}, ${T.sage})` }}/>
              <Typography variant="h4" sx={{ fontWeight:700, color:T.inkDark }}>🌿 Personalized Results</Typography>
            </Box>

            {/* ── Row 1: BMI + Foods to Avoid ── */}
            <Grid container spacing={3} sx={{ mb:3 }}>

              {/* BMI Card */}
              <Grid item xs={12} md={5}>
                <Card sx={{ ...cardBase, height:'100%' }}>
                  {/* green top stripe */}
                  <Box sx={{ height:5, background:`linear-gradient(90deg, ${T.leaf}, ${T.sage})` }}/>
                  <CardContent sx={{ p:3 }}>
                    <ResultSectionLabel >BMI Analysis</ResultSectionLabel>

                    {/* Big BMI number */}
                    <Box sx={{ display:'flex', alignItems:'flex-end', gap:1.5, mb:2 }}>
                      <Typography sx={{ fontSize:'3rem', fontWeight:800, lineHeight:1, color:T.leaf }}>{result?.user_bmi}</Typography>
                      <Typography sx={{ fontSize:'0.85rem', color:T.inkLight, mb:0.8 }}>kg/m²</Typography>
                    </Box>

                    {/* Category badge */}
                    <Box sx={{
                      display:'inline-flex', alignItems:'center', gap:1,
                      px:2, py:0.8, borderRadius:99,
                      background:bmiChipColor.bg,
                      border:`1.5px solid ${bmiChipColor.border}`,
                      mb:2,
                    }}>
                      <Box sx={{ width:8, height:8, borderRadius:'50%', background:bmiChipColor.border }}/>
                      <Typography sx={{ fontSize:'0.8rem', fontWeight:700, color:bmiChipColor.text, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                        {result?.predicted_bmi_category}
                      </Typography>
                    </Box>

                    <Divider sx={{ my:1.5, borderColor:T.borderGreen }}/>

                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                      <Box sx={{ width:8, height:8, borderRadius:'50%', background:T.sage }}/>
                      <Typography sx={{ fontSize:'0.78rem', color:T.inkLight }}>Verified by ML classification model</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Foods to Avoid Card */}
              <Grid item xs={12} md={7}>
                <Card sx={{ ...cardBase, height:'100%' }}>
                  <Box sx={{ height:5, background:`linear-gradient(90deg, #e53e3e, #fc8181)` }}/>
                  <CardContent sx={{ p:3 }}>
                    <ResultSectionLabel>Food to Avoid</ResultSectionLabel>
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mt:1 }}>
                      {(result?.foods_to_avoid ? String(result.foods_to_avoid).split(',') : []).map((t,idx)=>(
                        <Box key={idx} sx={{
                          px:1.5, py:0.5, borderRadius:99,
                          background:T.redPale, border:`1px solid ${T.redSoft}`,
                          fontSize:'0.78rem', fontWeight:500, color:'#c53030',
                        }}>{t.trim()}</Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ── Row 2: Meal Plan + Nutrient Summary ── */}
            <Grid container spacing={3} sx={{ mb:3 }}>

              {/* Meal Plan */}
              <Grid item xs={12} md={7}>
                <Card sx={cardBase}>
                  <Box sx={{ height:5, background:`linear-gradient(90deg, ${T.leaf}, ${T.sage})` }}/>
                  <CardContent sx={{ p:3 }}>
                    <ResultSectionLabel>Recommended Meal Plan</ResultSectionLabel>

                    {/* Table header */}
                    <Box sx={{
                      display:'grid', gridTemplateColumns:'1fr 90px 80px',
                      px:1.5, py:1,
                      borderRadius:1.5,
                      background:T.sagePale,
                      mb:0.5,
                    }}>
                      {['Dish','Portion %','Amount'].map(h=>(
                        <Typography key={h} sx={{ fontSize:'0.7rem', fontWeight:700, color:T.leafMid, textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</Typography>
                      ))}
                    </Box>

                    {(result?.meal_plan??[]).map((item,i)=>{
                      const grams = portionToGrams(item.portion_pct, totalMealGrams);
                      return (
                        <Box key={i} sx={{
                          display:'grid', gridTemplateColumns:'1fr 90px 80px',
                          alignItems:'center',
                          px:1.5, py:1.2,
                          borderRadius:1.5,
                          background: i%2===0 ? '#f8fffe' : T.white,
                          borderBottom:`1px solid ${T.border}`,
                          '&:last-of-type':{ borderBottom:'none' },
                        }}>
                          {/* Dish name */}
                          <Box sx={{ display:'flex', alignItems:'center', gap:1.2 }}>
                            <Box sx={{ width:6, height:6, borderRadius:'50%', background:T.sage, flexShrink:0 }}/>
                            <Typography sx={{ fontSize:'0.85rem', color:T.inkDark, fontWeight:500 }}>{item.dish}</Typography>
                          </Box>

                          {/* Portion % + bar */}
                          <Box>
                            <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.leaf, mb:0.4 }}>{item.portion_pct}%</Typography>
                            <Box sx={{height:5, borderRadius:99, background:T.border, overflow:'hidden', width:'80%' }}>
                              <Box sx={{ height:'100%', width:`${Math.min(100,item.portion_pct)}%`, borderRadius:99, background:`linear-gradient(90deg, ${T.sage}, ${T.leaf})`, transition:'width 0.7s ease' }}/>
                            </Box>
                          </Box>

                          {/* Grams badge */}
                          <Box sx={{
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            px:1.2, py:0.4, borderRadius:99,
                            background:T.sagePale, border:`1px solid ${T.borderGreen}`,
                            width:'fit-content',
                          }}>
                            <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.leaf }}>{grams} g</Typography>
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Total row */}
                    <Box sx={{
                      display:'grid', gridTemplateColumns:'1fr 90px 80px',
                      alignItems:'center',
                      px:1.5, py:1.2, mt:0.5,
                      borderRadius:1.5,
                      background:T.sagePale,
                      border:`1px solid ${T.borderGreen}`,
                    }}>
                      <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.leaf }}>Total</Typography>
                      <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.leaf }}>100%</Typography>
                      <Box sx={{ display:'inline-flex', alignItems:'center', px:1.2, py:0.4, borderRadius:99, background:T.leaf, width:'fit-content' }}>
                        <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.white }}>{totalMealGrams} g</Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" sx={{ mt:1.5, display:'block', color:T.inkLight }}>
                      Grams are BMI-adjusted via TDEE · Mifflin-St Jeor ({result.predicted_bmi_category}).
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Nutrient Summary */}
              <Grid item xs={12} md={5}>
                <Card sx={{ ...cardBase, height:'100%' }}>
                  <Box sx={{ height:5, background:`linear-gradient(90deg, ${T.gold}, #ecc94b)` }}/>
                  <CardContent sx={{ p:4 }}>
                    <ResultSectionLabel>Nutrient Summary</ResultSectionLabel>
                    <Stack spacing={2} sx={{ mb:3 }}>
                      <NutrientPill label="Calories" value={result?.totals?.calories_kcal} unit="kcal" color="#e53e3e" />
                      <NutrientPill label="Protein"  value={result?.totals?.protein_g}     unit="g"    color={T.sage}/>
                      <NutrientPill label="Carbs"    value={result?.totals?.carbs_g}        unit="g"    color={T.gold}/>
                      <NutrientPill label="Fats"     value={result?.totals?.fats_g}         unit="g"    color={T.bark}/>
                    </Stack>

                    <Divider sx={{ my:2, borderColor:T.border }}/>

                    <Typography sx={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.inkLight, mb:1.5 }}>Daily Macro Progress</Typography>
                    <Stack spacing={1.5}>
                      <MacroRow label="Protein"  value={result?.totals?.protein_g}     unit="g"    max={50}   color={T.sage}/>
                      <MacroRow label="Carbs"    value={result?.totals?.carbs_g}        unit="g"    max={200}  color={T.gold}/>
                      <MacroRow label="Calories" value={result?.totals?.calories_kcal} unit="kcal" max={2500} color="#e53e3e"/>
                      <MacroRow label="Fats"     value={result?.totals?.fats_g}         unit="g"    max={70}   color={T.bark}/>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ── Row 3: Shad Rasa table ── */}
            <Card sx={{ ...cardBase, mb:3 }}>
              <Box sx={{ height:5, background:`linear-gradient(90deg, ${T.leaf}, ${T.sage})` }}/>
              <CardContent sx={{ p:3 }}>
                <ResultSectionLabel>Ayurvedic Taste Separation — Shad Rasa</ResultSectionLabel>
                <Typography sx={{ fontSize:'0.8rem', color:T.inkLight, mb:2 }}>
                  The six tastes and their presence in your personalized meal plan.
                </Typography>

                {/* Table header — mirrors meal plan layout */}
                <Box sx={{
                  display:'grid', gridTemplateColumns:'170px 1fr 90px 80px',
                  px:1.5, py:1,
                  borderRadius:1.5,
                  background:T.sagePale,
                  mb:0.5,
                }}>
                  {['Taste', 'Dish', 'Portion %', 'Amount'].map(h => (
                    <Typography key={h} sx={{ fontSize:'0.7rem', fontWeight:700, color:T.leafMid, textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</Typography>
                  ))}
                </Box>

                {/* One row per (taste, dish) pair; empty tastes get a placeholder row */}
                {[...ALL_RASAS, 'unknown'].flatMap(rasa => {
                  const items = rasaGrouped?.[rasa] ?? [];
                  const label = rasa === 'unknown' ? 'Not Defined' : rasaLabel(rasa);
                  if (items.length === 0) return [{ label, item: null }];
                  return items.map(item => ({ label, item }));
                }).map(({ label, item }, i) => {
                  const grams = item ? portionToGrams(item.portion_pct, totalMealGrams) : null;
                  return (
                    <Box key={i} sx={{
                      display:'grid', gridTemplateColumns:'170px 1fr 90px 80px',
                      alignItems:'center',
                      px:1.5, py:1.1,
                      borderRadius:1.5,
                      background: i%2===0 ? '#f8fffe' : T.white,
                      borderBottom:`1px solid ${T.border}`,
                      '&:last-of-type':{ borderBottom:'none' },
                    }}>
                      {/* Taste label */}
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Box sx={{ width:6, height:6, borderRadius:'50%', background: item ? T.sage : T.border, flexShrink:0 }}/>
                        <Typography sx={{ fontSize:'0.8rem', fontWeight:600, color: item ? T.inkDark : T.inkLight }}>{label}</Typography>
                      </Box>

                      {/* Dish */}
                      {item
                        ? <Typography sx={{ fontSize:'0.82rem', color:T.inkMid }}>{item.dish}</Typography>
                        : <Typography sx={{ fontSize:'0.78rem', color:T.inkLight, fontStyle:'italic' }}>No dishes matched</Typography>
                      }

                      {/* Portion % + mini bar */}
                      {item ? (
                        <Box>
                          <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.leaf, mb:0.3 }}>{item.portion_pct}%</Typography>
                          <Box sx={{ height:4, borderRadius:99, background:T.border, overflow:'hidden', width:'75%' }}>
                            <Box sx={{ height:'100%', width:`${Math.min(100, item.portion_pct)}%`, borderRadius:99, background:`linear-gradient(90deg, ${T.sage}, ${T.leaf})` }}/>
                          </Box>
                        </Box>
                      ) : <Box/>}

                      {/* Grams pill */}
                      {item ? (
                        <Box sx={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          px:1.2, py:0.35, borderRadius:99,
                          background:T.sagePale, border:`1px solid ${T.borderGreen}`,
                          width:'fit-content',
                        }}>
                          <Typography sx={{ fontSize:'0.76rem', fontWeight:700, color:T.leaf }}>{grams} g</Typography>
                        </Box>
                      ) : <Box/>}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>

            {/* ── Download Button ── */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {pdfSuccess && <Alert severity="success" icon={<CheckCircle fontSize="inherit"/>} sx={{mb:2,borderRadius:3,fontWeight:500}}>Your Ayurvedic Diet Plan PDF has been downloaded successfully!</Alert>}
                <Button variant="contained" size="large" fullWidth onClick={handleDownloadPDF} disabled={pdfLoading||!result}
                  startIcon={pdfLoading?<CircularProgress size={22} sx={{color:'white'}}/>:pdfSuccess?<CheckCircle/>:<Download/>}
                  sx={{ py:1.8, borderRadius:3, fontSize:'1.05rem', fontWeight:600,
                    background: pdfSuccess?'linear-gradient(135deg, #2e7d32, #43a047)':'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)',
                    boxShadow:'0 4px 20px rgba(46,125,50,0.35)', letterSpacing:'0.03em', transition:'all 0.3s ease',
                    '&:hover':{background:'linear-gradient(135deg, #145214, #1b5e20, #2e7d32)',boxShadow:'0 6px 28px rgba(46,125,50,0.50)',transform:'translateY(-1px)'},
                    '&:active':{transform:'translateY(0)'},
                    '&.Mui-disabled':{background:'#bdbdbd',boxShadow:'none'},
                  }}>
                  {pdfLoading?'Generating PDF Report…':pdfSuccess?'PDF Downloaded!':'  Download My Ayurvedic Diet Report (PDF)'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{mt:1.5,display:'block',textAlign:'center',opacity:0.8}}>
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