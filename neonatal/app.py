from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Detailed cry type information
CRY_INFO = {
    1: {
        "type": "Belly Pain",
        "characteristics": [
            "High-pitched and intense crying",
            "Legs pulled up to belly",
            "Crying occurs after feeding"
        ],
        "possible_causes": [
            "Gas",
            "Colic",
            "Food sensitivity",
            "Digestive discomfort"
        ],
        "recommended_actions": [
            "Try gentle belly massage",
            "Hold baby upright after feeding",
            "Use bicycle leg movements",
            "Consider burping more frequently during feeds"
        ],
        "urgency_level": "Moderate",
        "when_to_call_doctor": [
            "Crying persists for more than 3 hours",
            "Baby refuses to feed",
            "Signs of fever present"
        ]
    },
    2: {
        "type": "Burping",
        "characteristics": [
            "Short, rhythmic cries",
            "Fussy during or after feeding",
            "Arching of back"
        ],
        "possible_causes": [
            "Trapped air during feeding",
            "Feeding position",
            "Eating too quickly"
        ],
        "recommended_actions": [
            "Pause feeding to burp baby",
            "Keep baby upright for 10-15 minutes after feeding",
            "Check bottle nipple size if bottle feeding",
            "Try different feeding positions"
        ],
        "urgency_level": "Low",
        "when_to_call_doctor": [
            "Excessive spitting up",
            "Signs of choking",
            "Refusing to feed"
        ]
    },
    3: {
        "type": "Discomfort",
        "characteristics": [
            "Intermittent crying",
            "Changes in cry intensity",
            "Movement or position changes cry pattern"
        ],
        "possible_causes": [
            "Wet or dirty diaper",
            "Temperature (too hot/cold)",
            "Tight clothing",
            "Need for position change"
        ],
        "recommended_actions": [
            "Check and change diaper if needed",
            "Adjust room temperature (ideal 68-72°F)",
            "Check for tight clothing or trapped limbs",
            "Try different holding positions"
        ],
        "urgency_level": "Low",
        "when_to_call_doctor": [
            "Signs of rash or skin irritation",
            "Fever present",
            "Crying persists after addressing basic needs"
        ]
    },
    4: {
        "type": "Hunger",
        "characteristics": [
            "Short, low-pitched cries",
            "Increases in intensity",
            "Accompanied by rooting reflex",
            "Sucking motions"
        ],
        "possible_causes": [
            "Time since last feed",
            "Growth spurt",
            "Insufficient milk intake",
            "Fast digestion"
        ],
        "recommended_actions": [
            "Offer feeding",
            "Check feeding schedule",
            "Ensure proper latching if breastfeeding",
            "Track feeding amounts and times"
        ],
        "urgency_level": "Moderate",
        "when_to_call_doctor": [
            "Poor weight gain",
            "Refusing to feed",
            "Signs of dehydration"
        ]
    },
    5: {
        "type": "Tiredness",
        "characteristics": [
            "Grumpy, whiny cry",
            "Rubbing eyes",
            "Decreased activity",
            "Yawning"
        ],
        "possible_causes": [
            "Overtiredness",
            "Overstimulation",
            "Disrupted sleep schedule",
            "Environmental factors"
        ],
        "recommended_actions": [
            "Create a calm environment",
            "Start bedtime routine",
            "Reduce stimulation",
            "Watch for sleep cues earlier"
        ],
        "urgency_level": "Low",
        "when_to_call_doctor": [
            "Significant changes in sleep pattern",
            "Signs of illness affecting sleep",
            "Excessive daytime sleepiness"
        ]
    }
}

@app.route("/")
def cry_analyzer():
    return render_template("cry_analyzer.html")

@app.route("/analyze-cry", methods=["POST"])
def analyze_cry():
    try:
        # In a real implementation, this would analyze the audio file
        # For now, we'll return a random cry type for demonstration
        import random
        
        cry_type = random.randint(1, 5)
        cry_info = CRY_INFO[cry_type]
        
        # Add timestamp for tracking
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return jsonify({
            "status": "success",
            "analysis_time": current_time,
            "cry_type": cry_type,
            "cry_meaning": cry_info["type"],
            "characteristics": cry_info["characteristics"],
            "possible_causes": cry_info["possible_causes"],
            "recommended_actions": cry_info["recommended_actions"],
            "urgency_level": cry_info["urgency_level"],
            "when_to_call_doctor": cry_info["when_to_call_doctor"],
            "note": "This is an automated analysis. Always trust your parental instincts and consult healthcare providers when in doubt."
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Running on a different port than the main app