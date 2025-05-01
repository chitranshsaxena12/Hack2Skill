import io
import asyncio
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing_extensions import Annotated, TypedDict
from langgraph.checkpoint.memory import MemorySaver
from typing import Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from langgraph.graph import START, MessagesState, StateGraph
import edge_tts
import os
from langchain_groq import ChatGroq
from langchain_core.tools import Tool
from langchain_google_community import GoogleSearchAPIWrapper
from langdetect import detect, DetectorFactory

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

groq_api_key = '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'
DetectorFactory.seed = 0  # For consistent language detection

# Configure environment variables
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "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"
os.environ["GOOGLE_API_KEY"] = "AIzaSyCGl7TNC0l4ywOLx9xxfIP72sjN6o9alQk"
os.environ["GOOGLE_CSE_ID"] = "1480a55f834c84048"

# Initialize Flask app with CORS
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Voice mapping for different languages
VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",       # Hindi
    "ta": "ta-IN-PallaviNeural",     # Tamil
    "te": "te-IN-ShrutiNeural",      # Telugu
    "ml": "ml-IN-SobhanaNeural",     # Malayalam
    "kn": "kn-IN-SapnaNeural",       # Kannada
    "mr": "mr-IN-AarohiNeural",      # Marathi
    "gu": "gu-IN-DhwaniNeural",      # Gujarati
    "bn": "bn-IN-TanishaaNeural",    # Bengali
    "pa": "pa-IN-JasleenNeural",     # Punjabi
    "ur": "ur-IN-UzmaNeural",        # Urdu
    "en": "en-US-JennyNeural",       # English
}

# Initialize LLM
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="mixtral-8x7b-32768"
)

# Setup prompt template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """You are a friendly and empathetic medical chatbot specializing in maternal and neonatal care. 
    Communicate in a clear, compassionate manner using {{language}}. Focus on providing accurate medical information 
    while being mindful of cultural sensitivities. Always refer serious medical concerns to healthcare professionals."""),
    MessagesPlaceholder(variable_name="messages"),
])

async def synthesize_speech(text: str, lang_code: str = "en") -> bytes:
    """Generate speech from text using edge-tts"""
    try:
        voice = VOICE_MAP.get(lang_code, VOICE_MAP["en"])
        communicate = edge_tts.Communicate(text, voice)
        
        output_file = "temp_speech.mp3"
        await communicate.save(output_file)
        
        with open(output_file, "rb") as f:
            audio_data = f.read()
            
        os.remove(output_file)  # Clean up
        return audio_data
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise

def process_chat(message: str, lang_code: str = "en") -> str:
    """Process chat messages through the LLM"""
    try:
        # Detect language if not specified
        if not lang_code:
            lang_code = detect(message)

        # Create message state
        state = {
            "messages": [HumanMessage(content=message)],
            "language": lang_code
        }
        
        # Get LLM response
        prompt = prompt_template.invoke(state)
        response = llm.invoke(prompt)
        
        return response.content
    except Exception as e:
        print(f"Chat Processing Error: {str(e)}")
        return "I apologize, but I encountered an error processing your message. Please try again."

# @app.route("/")
# def index():
#     return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        message = data.get("text", "")
        lang_code = data.get("lang", "en")
        
        if not message:
            return jsonify({"error": "No message provided"}), 400
            
        response = process_chat(message, lang_code)
        return jsonify({"reply": response})
        
    except Exception as e:
        print(f"Chat Endpoint Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/tts", methods=["POST"])
def tts():
    """Handle text-to-speech requests"""
    try:
        data = request.json
        text = data.get("text", "")
        lang = data.get("lang", "en")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        audio_data = asyncio.run(synthesize_speech(text, lang))
        
        return send_file(
            io.BytesIO(audio_data),
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
        
    except Exception as e:
        print(f"TTS Endpoint Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)





