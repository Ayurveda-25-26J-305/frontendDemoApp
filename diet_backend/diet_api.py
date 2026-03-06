from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# ============================================================
# LOAD MODELS AND DATA
# ============================================================

print("Loading models from Google Colab...")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, 'models')

print(f"Script directory: {SCRIPT_DIR}")
print(f"Models directory: {MODELS_DIR}")

try:
    # Load BMI prediction model
    bmi_model_path = os.path.join(MODELS_DIR, 'bmi_category_model.pkl')
    with open(bmi_model_path, 'rb') as f:
        bmi_model = pickle.load(f)
    print("✅ BMI model loaded")
    
    # Load meal dataset
    dataset_path = os.path.join(MODELS_DIR, 'meal_dataset.pkl')
    with open(dataset_path, 'rb') as f:
        meal_dataset = pickle.load(f)
    print(f"✅ Dataset loaded: {len(meal_dataset)} meals")
    
    # Load metadata
    metadata_path = os.path.join(MODELS_DIR, 'model_metadata.pkl')
    with open(metadata_path, 'rb') as f:
        metadata = pickle.load(f)
    print("✅ Metadata loaded")
    
except FileNotFoundError as e:
    print(f"❌ ERROR: Could not find PKL files!")
    print(f"   Looking in: {MODELS_DIR}")
    print(f"   Make sure these files exist:")
    print(f"   - {MODELS_DIR}/bmi_category_model.pkl")
    print(f"   - {MODELS_DIR}/meal_dataset.pkl")
    print(f"   - {MODELS_DIR}/model_metadata.pkl")
    print(f"\n   Your folder structure should be:")
    print(f"   diet_backend/")
    print(f"   ├── models/")
    print(f"   │   ├── bmi_category_model.pkl")
    print(f"   │   ├── meal_dataset.pkl")
    print(f"   │   └── model_metadata.pkl")
    print(f"   └── diet_api.py (this file)")
    exit(1)

print("\n" + "="*60)
print("AYURVEDIC DIET PLANNING API (Google Colab Models)")
print("="*60)
print(f"Dataset: {len(meal_dataset)} meal plans")
print(f"Diseases: {len(metadata['diseases'])}")
print("="*60)

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def calculate_bmi(weight_kg, height_cm):
    """Calculate BMI from weight and height"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)

def predict_bmi_category(age, gender, weight_kg, height_cm):
    """Predict BMI category using ML model"""
    bmi = calculate_bmi(weight_kg, height_cm)
    
    # Prepare features for model
    # Model expects: age, gender (encoded), weight_kg, height_cm
    gender_encoded = 1 if gender.lower() == 'male' else 0
    
    features = pd.DataFrame({
        'age': [age],
        'gender': [gender],  # Model will handle encoding
        'weight_kg': [weight_kg],
        'height_cm': [height_cm]
    })
    
    try:
        predicted_category = bmi_model.predict(features)[0]
        return bmi, predicted_category
    except Exception as e:
        print(f"Model prediction error: {e}")
        # Fallback to rule-based
        if bmi < 18.5:
            return bmi, 'underweight'
        elif bmi < 25:
            return bmi, 'normal'
        elif bmi < 30:
            return bmi, 'overweight'
        else:
            return bmi, 'obese'

def is_veg_safe(dish_name):
    """Check if dish is vegetarian-safe"""
    non_veg_keywords = [
        'chicken', 'mutton', 'beef', 'pork', 'fish', 'egg',
        'keema', 'prawn', 'shrimp', 'crab', 'meat'
    ]
    dish_lower = dish_name.lower()
    return not any(keyword in dish_lower for keyword in non_veg_keywords)

def generate_meal_plan(age, gender, weight_kg, height_cm, disease, 
                       meal_category, diet_preference):
    """Generate personalized meal plan"""
    
    # Step 1: Predict BMI category
    bmi, bmi_category = predict_bmi_category(age, gender, weight_kg, height_cm)
    
    # Step 2: Filter dataset
    filtered = meal_dataset[
        (meal_dataset['disease'].str.lower() == disease.lower()) &
        (meal_dataset['meal_category'].str.lower() == meal_category.lower()) &
        (meal_dataset['diet_preference'].str.lower() == diet_preference.lower()) &
        (meal_dataset['bmi_category'].str.lower() == bmi_category.lower())
    ]
    
    # Step 3: Apply veg safety filter if needed
    if diet_preference.lower() == 'veg':
        filtered = filtered[filtered['dish'].apply(is_veg_safe)]
    
    # Step 4: Check if we have results
    if len(filtered) == 0:
        return None
    
    # Step 5: Select random meal plan (4 dishes)
    selected_meal = filtered.sample(n=1).iloc[0]
    
    # Step 6: Extract meal plan
    meal_plan = []
    for i in range(1, 5):  # dish_1 to dish_4
        dish_col = f'dish_{i}'
        portion_col = f'portion_percent_{i}'
        
        if dish_col in selected_meal and portion_col in selected_meal:
            meal_plan.append({
                'dish': selected_meal[dish_col],
                'portion_percent': float(selected_meal[portion_col])
            })
    
    # Step 7: Extract nutrition info
    nutrition = {
        'total_calories_kcal': float(selected_meal.get('total_calories_kcal', 0)),
        'protein_g': float(selected_meal.get('protein_g', 0)),
        'carbs_g': float(selected_meal.get('carbs_g', 0)),
        'fats_g': float(selected_meal.get('fats_g', 0))
    }
    
    # Step 8: Get foods to avoid
    foods_to_avoid = selected_meal.get('foods_to_avoid', 'No specific restrictions')
    
    return {
        'user_info': {
            'bmi': bmi,
            'bmi_category': bmi_category,
            'age': age,
            'gender': gender
        },
        'meal_info': {
            'meal_category': meal_category,
            'diet_preference': diet_preference,
            'disease': disease
        },
        'foods_to_avoid': foods_to_avoid,
        'meal_plan': meal_plan,
        'nutrition': nutrition
    }

# ============================================================
# API ENDPOINTS
# ============================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'Diet Planning API (Colab)',
        'dataset_size': len(meal_dataset)
    })

@app.route('/metadata', methods=['GET'])
def get_metadata():
    """Get available diseases, meal categories, etc."""
    return jsonify(metadata)

@app.route('/predict_diet', methods=['POST'])
def predict_diet():
    """Main prediction endpoint"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['age', 'gender', 'weight_kg', 'height_cm', 
                          'disease', 'meal_category', 'diet_preference']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract parameters
        age = int(data['age'])
        gender = data['gender']
        weight_kg = float(data['weight_kg'])
        height_cm = float(data['height_cm'])
        disease = data['disease']
        meal_category = data['meal_category']
        diet_preference = data['diet_preference']
        
        # Validate values
        if age < 1 or age > 120:
            return jsonify({
                'success': False,
                'error': 'Age must be between 1 and 120'
            }), 400
        
        if weight_kg < 1 or weight_kg > 250:
            return jsonify({
                'success': False,
                'error': 'Weight must be between 1 and 250 kg'
            }), 400
        
        if height_cm < 50 or height_cm > 250:
            return jsonify({
                'success': False,
                'error': 'Height must be between 50 and 250 cm'
            }), 400
        
        # Generate meal plan
        result = generate_meal_plan(
            age, gender, weight_kg, height_cm,
            disease, meal_category, diet_preference
        )
        
        if result is None:
            return jsonify({
                'success': False,
                'error': f'No meal plan found for: disease={disease}, meal={meal_category}, preference={diet_preference}'
            }), 404
        
        # Return success response
        return jsonify({
            'success': True,
            **result
        })
        
    except Exception as e:
        print(f"Error in predict_diet: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict_bmi', methods=['POST'])
def predict_bmi_only():
    """Predict BMI category only"""
    try:
        data = request.json
        
        age = int(data['age'])
        gender = data['gender']
        weight_kg = float(data['weight_kg'])
        height_cm = float(data['height_cm'])
        
        bmi, category = predict_bmi_category(age, gender, weight_kg, height_cm)
        
        return jsonify({
            'success': True,
            'bmi': bmi,
            'bmi_category': category
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == '__main__':
    print(f"\nServer: http://localhost:5001")
    print("="*60 + "\n")
    
    # Run on port 5001 (different from your prediction module on 5000)
    app.run(host='0.0.0.0', port=5001, debug=True)