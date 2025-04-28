
import io
import asyncio
from flask import Flask, request, jsonify, send_file, render_template
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
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader

from dotenv import load_dotenv

load_dotenv()

groq_api_key=os.getenv('GROQ_API_KEY')

# fix for consistent results
DetectorFactory.seed = 0

#
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "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"
os.environ["GOOGLE_API_KEY"] = "AIzaSyCGl7TNC0l4ywOLx9xxfIP72sjN6o9alQk"
config = {"configurable": {"thread_id": "abc123"}}
os.environ["GOOGLE_CSE_ID"] = "1480a55f834c84048"


# ——— Setup ———
app = Flask(__name__, static_folder="static", template_folder="templates")

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are Matricare, a friendly and empathetic conversational medical chatbot designed specifically to support rural women, 
            mothers, and newborn babies who often lack timely access to quality healthcare due to low literacy, poor infrastructure, and 
            limited medical staff. You speak in a gentle, female voice—using female grammatical forms in all languages—and aim to build 
            rapport as if speaking with a caring friend. Answer all questions to the best of your ability in {{language}}.

            Additional Abilities:
            
            1. Conversational Engagement & Follow-up
            
            Actively engage users by asking relevant follow-up questions (e.g., age, existing conditions, symptoms) to tailor your 
            medical advice.
            
            Use open, inviting phrases (e.g., “Could you tell me how old you are?” or “Do you have any other health concerns I should 
            know about?”) to gather necessary context.
            
            2. Language Detection and Response Adaptation
            
            Detect the language of the user's query and respond in the same language to ensure understanding and comfort.
            
            3. Contextual Medical Relevance
            
            Always relate general medical questions to how they specifically impact pregnant women, mothers, or newborn children.
            
            Emphasize implications for maternal and child health (e.g., diabetes management during pregnancy, nutrition for breastfeeding).
            
            4. Female-Only Grammatical Forms

            In languages with gendered grammar (e.g., Hindi), always use and never deviate from feminine verb forms 
            (e.g., "main madad kar sakti hu", "karti hu", "sakti hu") rather than any masculine forms ("karta hu", "sakta hu").
        
            Under no circumstances generate masculine endings or pronouns; your language must consistently reflect a female speaker.
            
            Rules You Must Follow:
            
            1. Medical Focus Only
            Only respond to questions or concerns related to:
            
            Healthcare symptoms and treatments
            
            Health education, hygiene, and nutrition
            
            Maternal and child care, first aid
            
            2. Respectful Decline for Non-Medical Topics
            If the question is not related to health or medicine, politely reply:
            
            "I'm sorry, I don't have much knowledge about this as I have been trained only on medical information."
            
            3. No Guessing or Misinformation
            If you're unsure or lack sufficient information to answer accurately, respond:
            
            "I'm sorry, I don't have enough information to answer that accurately."
            
            4. Greeting Handling
            If greeted (e.g., "Hi", "Hello", "Good morning"), respond:
            
            "Hello! How can I help you with your health today?"
            
            5. Stay Polite, Clear, and Empathetic
            Use simple, compassionate, and easy-to-understand language, mindful that your audience
             may have low literacy or limited medical resources.
            
            Example Enhancement:
            
            User: "What is diabetes?"
            
            Matricare (in user's language):'Diabetes is a condition where the body cannot properly control blood sugar levels.
            For pregnant women, diabetes can increase the risk of premature delivery, high birth weight, or complications during childbirth.
            Could you tell me your age and whether you or someone in your family has been diagnosed with diabetes? Knowing this helps me 
            give more personalized advice.'""",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)
#
#
class State(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

workflow = StateGraph(state_schema=State)
#
# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.0-flash-001",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2
#     # other params...
# )

llm=ChatGroq(groq_api_key=groq_api_key,
             model_name="Llama3-8b-8192")

INDIAN_LANGUAGE_VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",       # Hindi - Female
    "ta": "ta-IN-PallaviNeural",     # Tamil - Female
    "te": "te-IN-ShrutiNeural",      # Telugu - Female
    "ml": "ml-IN-SobhanaNeural",     # Malayalam - Female
    "kn": "kn-IN-SapnaNeural",       # Kannada - Female
    "mr": "mr-IN-AarohiNeural",      # Marathi - Female
    "gu": "gu-IN-DhwaniNeural",      # Gujarati - Female
    "bn": "bn-IN-TanishaaNeural",    # Bengali - Female
    "pa": "pa-IN-JasleenNeural",     # Punjabi - Female
    "ur": "ur-IN-UzmaNeural",        # Urdu - Female
}

async def _synthesize(text: str, out_file: str,lang_code: str = "hi"):
    voice = INDIAN_LANGUAGE_VOICE_MAP.get(lang_code, "hi-IN-SwaraNeural")  # Default to Hindi
    communicate = edge_tts.Communicate(text, voice=voice)
    await communicate.save(out_file)

def synthesize_to_bytes(text: str,lang_code:str) -> bytes:
    tmp = "output.mp3"
    asyncio.run(_synthesize(text, tmp,lang_code))
    with open(tmp, "rb") as f:
        data = f.read()
    return data

search = GoogleSearchAPIWrapper()

google_search_tool = Tool(
    name="google_search",
    description="Search Google for recent results.",
    func=search.run,
)
def call_model_sync(state: State):
    prompt = prompt_template.invoke(state)
    response = llm.invoke(prompt)

    # Extract the last message
    message = response.content.lower()

    # Fallback conditions (you can enhance these rules further)
    fallback_phrases = [
        "i'm sorry, i don't have enough information",
        "i'm sorry, i don't have much knowledge about this",
        "i'm not sure",
        "i cannot answer"
    ]

    if any(phrase in message for phrase in fallback_phrases):
        user_query = state["messages"][-1].content
        print(f"Falling back to Google search for: {user_query}")
        search_result = google_search_tool.run(user_query)
        return {"messages": f"I'm not fully sure about that, but here's something I found online:\n\n{search_result}"}

    return {"messages": response}


# def call_model_sync(state: State):
#     prompt = prompt_template.invoke(state)
#     response = llm.invoke(prompt)
#     return {"messages": response}

workflow = StateGraph(state_schema=MessagesState)
workflow.add_edge(START, "model")
workflow.add_node("model", call_model_sync)
app1 = workflow.compile(checkpointer=MemorySaver())

# ——— Routes ———
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_text = data.get('text', '')
    lang_code = data.get('lang', 'hi')
    LANGUAGE_CODE_TO_NAME = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "kn": "Kannada",
    "mr": "Marathi",
    "gu": "Gujarati",
    "bn": "Bengali",
    "pa": "Punjabi",
    "ur": "Urdu"
    }


    print(user_text)
    print(lang_code)
    print(LANGUAGE_CODE_TO_NAME.get(lang_code, "Unknown Language"))
    output = app1.invoke({"messages": [HumanMessage(content=user_text)],"language": LANGUAGE_CODE_TO_NAME.get(lang_code, "Unknown Language")}, config)
    final_response = output['messages'][-1]
    return jsonify(reply=final_response.content)

@app.route("/tts", methods=["POST"])
def tts():
    data = request.json
    text = data.get('text', '')
    lang_code = data.get('lang', 'hi')
    print(lang_code)
    mp3_data = synthesize_to_bytes(text,lang_code)
    return send_file(
        io.BytesIO(mp3_data),
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )

if __name__ == "__main__":
    app.run(debug=True)





