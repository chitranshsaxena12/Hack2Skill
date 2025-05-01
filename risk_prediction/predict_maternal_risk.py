from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
import traceback

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def parse_blood_pressure(bp_string):
    try:
        if not bp_string or '/' not in bp_string:
            return 0, 0
        systolic, diastolic = map(int, bp_string.split('/'))
        return systolic, diastolic
    except ValueError as e:
        logger.error(f"Error parsing blood pressure: {bp_string}")
        return 0, 0

def safe_int_conversion(value, default=0):
    try:
        return int(float(value)) if value is not None else default
    except (ValueError, TypeError):
        return default

def calculate_risk_score(data):
    try:
        # Initialize base risk score
        risk_score = 0
        
        # Log incoming data for debugging
        logger.debug(f"Calculating risk score for data: {data}")
        
        # High-risk factors (each worth 2 points)
        systolic, diastolic = parse_blood_pressure(data.get('bloodPressure', ''))
        high_risk_factors = [
            data.get('bleedingEpisodes', False),
            data.get('contractionCount', False),
            data.get('fluidLeak', False),
            systolic > 140 or diastolic > 90,  # High blood pressure
            safe_int_conversion(data.get('bloodSugar')) > 140,  # High blood sugar
            safe_int_conversion(data.get('dizzinessEpisodes')) > 3,  # Frequent dizziness
            data.get('slowHealingWounds', False),  # Slow healing wounds
            safe_int_conversion(data.get('muac')) < 23,  # Low MUAC indicating malnutrition
        ]
        risk_score += sum(high_risk_factors) * 2

        # Medium-risk factors (each worth 1 point)
        medium_risk_factors = [
            data.get('painCramping', False),
            data.get('utiSymptoms', False),
            data.get('swelling', False),
            data.get('paleness', False),
            safe_int_conversion(data.get('tirednessScore')) > 3,
            safe_int_conversion(data.get('stressLevel')) > 3,
            safe_int_conversion(data.get('anxietyScore')) > 3,
            safe_int_conversion(data.get('phq2Score')) > 3,
            safe_int_conversion(data.get('thirstFrequency')) > 3,
            safe_int_conversion(data.get('urinationFrequency')) > 3,
            safe_int_conversion(data.get('appetiteScore')) < 2,
            data.get('hairCondition', False),
            data.get('skinCondition', False),
            safe_int_conversion(data.get('dietaryDiversity')) < 4,
            safe_int_conversion(data.get('mealFrequency')) < 3,
            safe_int_conversion(data.get('physicalActivity')) < 15,  # Less than 15 minutes per day
        ]
        risk_score += sum(medium_risk_factors)

        # Protective factors (subtract 0.5 points each)
        protective_factors = [
            safe_int_conversion(data.get('ironTablets')) >= 5,  # Taking iron tablets regularly
            safe_int_conversion(data.get('dietaryIron')) >= 4,  # Good dietary iron intake
            safe_int_conversion(data.get('dietaryDiversity')) >= 6,  # Good dietary diversity
            safe_int_conversion(data.get('sleepHours')) >= 7,  # Adequate sleep
            safe_int_conversion(data.get('supportScore')) >= 4,  # Good support system
            safe_int_conversion(data.get('physicalActivity')) >= 30,  # At least 30 minutes of activity
            safe_int_conversion(data.get('mealFrequency')) >= 4,  # Regular meals
        ]
        risk_score -= sum(protective_factors) * 0.5

        logger.debug(f"Calculated risk score: {risk_score}")
        
        return max(0, min(10, risk_score))  # Clamp between 0 and 10
    except Exception as e:
        logger.error(f"Error in calculate_risk_score: {str(e)}\n{traceback.format_exc()}")
        raise

def get_risk_level(score):
    if score >= 6:
        return "HIGH"
    elif score >= 3:
        return "MEDIUM"
    else:
        return "LOW"

def get_recommendations(data, risk_level):
    try:
        recommendations = []
        
        # Always include these basic recommendations
        recommendations.append("Continue regular prenatal check-ups with your healthcare provider.")
        
        # High blood pressure recommendations
        systolic, diastolic = parse_blood_pressure(data.get('bloodPressure', ''))
        if systolic > 140 or diastolic > 90:
            recommendations.append("Monitor your blood pressure daily and consult your healthcare provider immediately.")
            recommendations.append("Reduce salt intake and rest more frequently.")

        # Bleeding/cramping recommendations
        if data.get('bleedingEpisodes') or data.get('painCramping'):
            recommendations.append("Seek immediate medical attention for any bleeding or severe cramping.")

        # Nutritional recommendations
        if safe_int_conversion(data.get('ironTablets')) < 5:
            recommendations.append("Take your prescribed iron supplements regularly.")
        if safe_int_conversion(data.get('dietaryDiversity')) < 5:
            recommendations.append("Increase your dietary diversity by including more fruits, vegetables, and protein sources.")

        # Sleep and stress recommendations
        if safe_int_conversion(data.get('sleepHours')) < 7:
            recommendations.append("Try to get at least 7-8 hours of sleep per night.")
        if safe_int_conversion(data.get('stressLevel')) > 3:
            recommendations.append("Practice stress-reduction techniques like gentle exercise, meditation, or prenatal yoga.")

        # Emergency recommendations for high risk
        if risk_level == "HIGH":
            recommendations.insert(0, "🚨 IMPORTANT: Schedule an immediate appointment with your healthcare provider.")
            recommendations.append("Keep emergency contact numbers readily available.")

        return recommendations
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}\n{traceback.format_exc()}")
        raise

def assess_maternal_conditions(data):
    conditions = {}
    
    # Gestational Diabetes Risk
    blood_sugar = safe_int_conversion(data.get('bloodSugar'))
    thirst = safe_int_conversion(data.get('thirstFrequency'))
    urination = safe_int_conversion(data.get('urinationFrequency'))
    healing = data.get('slowHealingWounds', False)
    
    gd_score = 0
    if blood_sugar > 120: gd_score += 3
    if thirst > 3: gd_score += 2
    if urination > 3: gd_score += 2
    if healing: gd_score += 2
    
    conditions['gestational_diabetes'] = {
        'score': min(10, gd_score),
        'note': "Blood sugar and related symptoms indicate potential diabetes risk. Medical consultation advised." if gd_score > 4 
               else "Blood sugar indicators appear normal."
    }

    # Gestational Anemia Risk
    iron_intake = safe_int_conversion(data.get('ironTablets'))
    dietary_iron = safe_int_conversion(data.get('dietaryIron'))
    dietary_diversity = safe_int_conversion(data.get('dietaryDiversity'))
    paleness = data.get('paleness', False)
    dizziness = safe_int_conversion(data.get('dizzinessEpisodes'))
    tiredness = safe_int_conversion(data.get('tirednessScore'))
    
    anemia_score = 0
    if iron_intake < 5: anemia_score += 2
    if dietary_iron < 3: anemia_score += 2
    if dietary_diversity < 4: anemia_score += 1
    if paleness: anemia_score += 2
    if dizziness > 2: anemia_score += 2
    if tiredness > 3: anemia_score += 1
    
    conditions['gestational_anemia'] = {
        'score': min(10, anemia_score),
        'note': "Multiple indicators suggest anemia risk. Increase iron intake and consult healthcare provider." if anemia_score > 5 
               else "Iron intake and related indicators appear adequate."
    }

    # Preterm Labor Risk
    contractions = data.get('contractionCount', False)
    fluid_leak = data.get('fluidLeak', False)
    cramping = data.get('painCramping', False)
    
    preterm_score = 0
    if contractions: preterm_score += 4
    if fluid_leak: preterm_score += 4
    if cramping: preterm_score += 2
    
    conditions['preterm_labor'] = {
        'score': min(10, preterm_score),
        'note': "Signs of potential preterm labor present. Immediate medical attention recommended." if preterm_score > 3 
               else "No significant signs of preterm labor."
    }

    # Miscarriage Risk
    bleeding = data.get('bleedingEpisodes', False)
    severe_cramping = data.get('painCramping', False) and safe_int_conversion(data.get('gestationalAge')) < 20
    
    miscarriage_score = 0
    if bleeding: miscarriage_score += 5
    if severe_cramping: miscarriage_score += 3
    
    conditions['miscarriage'] = {
        'score': min(10, miscarriage_score),
        'note': "Concerning symptoms detected. Seek immediate medical care." if miscarriage_score > 2 
               else "No immediate concerns for miscarriage risk."
    }

    # Mental Health Risk
    anxiety = safe_int_conversion(data.get('anxietyScore'))
    phq2 = safe_int_conversion(data.get('phq2Score'))
    stress = safe_int_conversion(data.get('stressLevel'))
    support = safe_int_conversion(data.get('supportScore'))
    sleep = safe_int_conversion(data.get('sleepHours'))
    
    mental_health_score = 0
    mental_health_score += anxiety
    mental_health_score += phq2
    mental_health_score += stress
    mental_health_score -= support
    if sleep < 6: mental_health_score += 2
    
    conditions['mental_health'] = {
        'score': min(10, max(0, mental_health_score)),
        'note': "Mental health support recommended." if mental_health_score > 5 
               else "Mental health indicators within normal range."
    }

    # Hypertension Risk
    systolic, diastolic = parse_blood_pressure(data.get('bloodPressure', ''))
    swelling = data.get('swelling', False)
    
    bp_score = 0
    if systolic > 140: bp_score += 3
    if diastolic > 90: bp_score += 3
    if swelling: bp_score += 2
    
    conditions['hypertension'] = {
        'score': min(10, bp_score),
        'note': "Blood pressure elevated. Medical consultation advised." if bp_score > 3 
               else "Blood pressure within normal range."
    }

    # Malnutrition Risk
    muac = safe_int_conversion(data.get('muac'))
    diet_score = safe_int_conversion(data.get('dietaryDiversity'))
    meal_freq = safe_int_conversion(data.get('mealFrequency'))
    appetite = safe_int_conversion(data.get('appetiteScore'))
    
    nutrition_score = 0
    if muac < 23: nutrition_score += 3
    if diet_score < 4: nutrition_score += 2
    if meal_freq < 3: nutrition_score += 2
    if appetite < 3: nutrition_score += 2
    
    conditions['malnutrition'] = {
        'score': min(10, nutrition_score),
        'note': "Nutritional improvements recommended." if nutrition_score > 4 
               else "Nutrition appears adequate."
    }

    return conditions

@app.route('/predict-maternal-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        logger.info("Received prediction request")
        logger.debug(f"Request data: {data}")
        
        # Calculate risk score
        risk_score = calculate_risk_score(data)
        
        # Determine risk level
        risk_level = get_risk_level(risk_score)
        
        # Get recommendations
        recommendations = get_recommendations(data, risk_level)
        
        # Get maternal conditions assessment
        maternal_conditions = assess_maternal_conditions(data)
        
        response = {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'recommendations': recommendations,
            'maternal_conditions': maternal_conditions
        }
        
        logger.info(f"Sending response with risk level: {risk_level}")
        return jsonify(response)
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(port=3003, debug=True)