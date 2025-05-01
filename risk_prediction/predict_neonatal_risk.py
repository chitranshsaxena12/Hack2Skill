import numpy as np
from typing import Dict, List, TypedDict
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class RiskAssessment(TypedDict):
    level: str
    score: float
    recommendations: List[str]
    neonatalConditions: Dict[str, Dict[str, float]]

def calculate_vital_signs_risk(data: dict) -> float:
    risk_score = 0
    
    # Temperature risk (normal range: 36.5-37.5°C)
    temp = data.get('temperature', 37)
    if temp < 36 or temp > 38:
        risk_score += 2
    elif temp < 36.5 or temp > 37.5:
        risk_score += 1

    # Respiratory rate risk (normal range: 40-60 breaths/min)
    resp_rate = data.get('respiratoryRate', 50)
    if resp_rate < 30 or resp_rate > 70:
        risk_score += 2
    elif resp_rate < 40 or resp_rate > 60:
        risk_score += 1

    # Heart rate risk (normal range: 120-160 beats/min)
    heart_rate = data.get('heartRate', 140)
    if heart_rate < 100 or heart_rate > 180:
        risk_score += 2
    elif heart_rate < 120 or heart_rate > 160:
        risk_score += 1

    return risk_score / 6  # Normalize to 0-1 scale

def calculate_feeding_risk(data: dict) -> float:
    risk_score = 0
    
    # Feeding pattern risk
    feeding_patterns = {'poor': 3, 'fair': 2, 'good': 1, 'excellent': 0}
    risk_score += feeding_patterns.get(data.get('feedingPattern', 'good'), 1)
    
    # Feeding frequency risk (normal: 8-12 times/day)
    freq = data.get('feedingFrequency', 10)
    if freq < 6 or freq > 14:
        risk_score += 2
    elif freq < 8 or freq > 12:
        risk_score += 1

    # Weight gain risk
    weight_gain = data.get('weightGain', 0)
    if weight_gain < 15:  # Less than 15g/day
        risk_score += 2
    elif weight_gain < 20:  # Less than 20g/day
        risk_score += 1

    return risk_score / 7  # Normalize to 0-1 scale

def calculate_development_risk(data: dict) -> float:
    risk_score = 0
    
    # Growth parameters
    height_gain = data.get('heightGain', 0)
    if height_gain < 0.5:  # Less than 0.5cm/week
        risk_score += 1

    head_circ_gain = data.get('headCircumferenceGain', 0)
    if head_circ_gain < 0.5:  # Less than 0.5cm/week
        risk_score += 1

    # Sleep pattern risk
    sleep_patterns = {'poor': 3, 'fair': 2, 'good': 1, 'excellent': 0}
    risk_score += sleep_patterns.get(data.get('sleepPattern', 'good'), 1)

    return risk_score / 5  # Normalize to 0-1 scale

def calculate_health_issues_risk(data: dict) -> float:
    risk_score = 0
    
    # Check for various health issues
    if data.get('jaundice', False):
        risk_score += 2
    if data.get('vomiting', False):
        risk_score += 1
    if data.get('diarrhea', False):
        risk_score += 1
    if data.get('fever', False):
        risk_score += 2
    if data.get('cough', False):
        risk_score += 1
    
    # Breathing issues
    breathing_risks = {
        'normal': 0,
        'fast': 1,
        'difficult': 2,
        'noisy': 1
    }
    risk_score += breathing_risks.get(data.get('breathing', 'normal'), 0)

    # Activity level
    activity_risks = {
        'normal': 0,
        'lethargic': 2,
        'irritable': 1,
        'excessive-crying': 1
    }
    risk_score += activity_risks.get(data.get('activity', 'normal'), 0)

    return risk_score / 10  # Normalize to 0-1 scale

def predict_neonatal_risk(weekly_data: dict) -> RiskAssessment:
    # Calculate risk scores for different categories
    vital_signs_risk = calculate_vital_signs_risk(weekly_data)
    feeding_risk = calculate_feeding_risk(weekly_data)
    development_risk = calculate_development_risk(weekly_data)
    health_issues_risk = calculate_health_issues_risk(weekly_data)

    # Calculate overall risk score (weighted average)
    weights = {
        'vital_signs': 0.3,
        'feeding': 0.3,
        'development': 0.2,
        'health_issues': 0.2
    }

    overall_score = (
        vital_signs_risk * weights['vital_signs'] +
        feeding_risk * weights['feeding'] +
        development_risk * weights['development'] +
        health_issues_risk * weights['health_issues']
    )

    # Determine risk level
    if overall_score < 0.3:
        risk_level = 'low'
    elif overall_score < 0.6:
        risk_level = 'medium'
    else:
        risk_level = 'high'

    # Generate recommendations based on risk factors
    recommendations = []
    if vital_signs_risk > 0.5:
        recommendations.append("Schedule an immediate check-up with your pediatrician to assess vital signs")
    if feeding_risk > 0.5:
        recommendations.append("Consult with a lactation specialist or pediatrician about feeding concerns")
    if development_risk > 0.5:
        recommendations.append("Monitor growth parameters closely and discuss with your healthcare provider")
    if health_issues_risk > 0.5:
        recommendations.append("Seek immediate medical attention for current health issues")

    # Add general recommendations
    if risk_level == 'high':
        recommendations.append("Consider emergency medical evaluation")
    elif risk_level == 'medium':
        recommendations.append("Schedule a follow-up appointment within the next few days")
    else:
        recommendations.append("Continue regular monitoring and scheduled check-ups")

    return {
        'level': risk_level,
        'score': float(overall_score),
        'recommendations': recommendations,
        'neonatalConditions': {
            'vital_signs': {'score': float(vital_signs_risk), 'note': 'Assessment of temperature, respiratory rate, and heart rate'},
            'feeding': {'score': float(feeding_risk), 'note': 'Evaluation of feeding patterns and weight gain'},
            'development': {'score': float(development_risk), 'note': 'Analysis of growth and development markers'},
            'health_issues': {'score': float(health_issues_risk), 'note': 'Assessment of current health problems'}
        }
    }

@app.route('/predict-neonatal-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        result = predict_neonatal_risk(data)
        return jsonify({
            'risk_level': result['level'],
            'risk_score': result['score'],
            'recommendations': result['recommendations'],
            'neonatal_conditions': result['neonatalConditions']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3005, debug=True)