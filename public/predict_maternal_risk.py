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
        systolic, _ = parse_blood_pressure(data.get('bloodPressure', ''))
        high_risk_factors = [
            data.get('bleedingEpisodes', False),
            data.get('contractionCount', False),
            data.get('fluidLeak', False),
            systolic > 140,  # High systolic BP
            safe_int_conversion(data.get('bloodSugar')) > 140,  # High blood sugar
        ]
        risk_score += sum(high_risk_factors) * 2

        # Medium-risk factors (each worth 1 point)
        medium_risk_factors = [
            data.get('painCramping', False),
            data.get('utiSymptoms', False),
            data.get('swelling', False),
            safe_int_conversion(data.get('dizzinessEpisodes')) > 2,
            safe_int_conversion(data.get('tirednessScore')) > 3,
            safe_int_conversion(data.get('stressLevel')) > 3,
            safe_int_conversion(data.get('anxietyScore')) > 3,
        ]
        risk_score += sum(medium_risk_factors)

        # Protective factors (subtract 0.5 points each)
        protective_factors = [
            safe_int_conversion(data.get('ironTablets')) >= 5,  # Taking iron tablets regularly
            safe_int_conversion(data.get('dietaryDiversity')) >= 5,  # Good dietary diversity
            safe_int_conversion(data.get('sleepHours')) >= 7,  # Adequate sleep
            safe_int_conversion(data.get('supportScore')) >= 4,  # Good support system
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
        
        response = {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'recommendations': recommendations
        }
        logger.info(f"Sending response with risk level: {risk_level}")
        return jsonify(response)
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)