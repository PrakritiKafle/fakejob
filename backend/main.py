from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware
import os
import re
import nltk
from nltk.corpus import stopwords
import uvicorn
import json
from typing import Dict, Optional, List
from datetime import datetime

app = FastAPI(title="Forensic Job Detection API")

# --- DATABASE SETTINGS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "users.json")

def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({}, f)
        print("✅ Database created at:", DB_FILE)

def get_all_users():
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_users(users_data):
    with open(DB_FILE, 'w') as f:
        json.dump(users_data, f, indent=2)

init_db()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NLTK & ML MODELS ---
def setup_nltk():
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)

setup_nltk()
stop_words = set(stopwords.words('english'))

MODELS_PATH = os.path.join(BASE_DIR, "models")
models_loaded = False
try:
    tfidf = joblib.load(os.path.join(MODELS_PATH, "tfidf_vectorizer.pkl"))
    svm_model = joblib.load(os.path.join(MODELS_PATH, "svm_model.pkl"))
    nb_model = joblib.load(os.path.join(MODELS_PATH, "nb_model.pkl"))
    lr_model = joblib.load(os.path.join(MODELS_PATH, "lr_model.pkl"))
    models_loaded = True
    print("✅ AI Models Ready")
except Exception as e:
    print(f"⚠️ Model Load Error: {e}")

# --- SCHEMAS ---
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class JobInput(BaseModel):
    description: str
    email: str 

# --- HELPERS ---
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    return " ".join([w for w in text.split() if w not in stop_words])

# --- ROUTES ---

@app.get("/")
async def status():
    return {"status": "online", "models": models_loaded}

@app.post("/signup")
async def signup(user: UserSignup):
    users = get_all_users()
    email = user.email.lower().strip()
    
    if email in users:
        raise HTTPException(status_code=400, detail="Investigator already registered")
    
    users[email] = {
        "name": user.name,
        "password": user.password,
        "history": [],
        "created_at": datetime.now().isoformat()
    }
    save_users(users)
    return {"message": "Account created successfully"}

@app.post("/login")
async def login(user: UserLogin):
    users = get_all_users()
    email = user.email.lower().strip()
    
    user_record = users.get(email)
    if user_record and user_record["password"] == user.password:
        return {
            "status": "success",
            "user": user_record["name"],
            "email": email,
            "history": user_record.get("history", [])
        }
    raise HTTPException(status_code=401, detail="Invalid Investigator Credentials")

@app.post("/analyze")
async def analyze_job(data: JobInput):
    if not models_loaded:
        raise HTTPException(status_code=503, detail="AI Analysis Engine Offline")

    text = data.description.strip()
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="Description too short")

    # 1. AI Analysis Logic (Keep your existing ML logic)
    processed = clean_text(text)
    vect = tfidf.transform([processed])
    p_svm = float(svm_model.predict_proba(vect)[0][1])
    p_nb = float(nb_model.predict_proba(vect)[0][1])
    p_lr = float(lr_model.predict_proba(vect)[0][1])
    
    avg_prob = (p_svm + p_nb + p_lr) / 3
    is_fake = avg_prob > 0.40 
    result_label = "🚨 FAKE" if is_fake else "✅ GENUINE"
    confidence = round(avg_prob * 100 if is_fake else (1 - avg_prob) * 100, 2)

    # 2. FIXED DATABASE LOGIC
    users = get_all_users()
    email_to_find = data.email.lower().strip() # Normalize input
    
    current_history = []

    # Check if user exists (Normalizing keys in users.json to lowercase for the check)
    user_found = False
    for existing_email in users.keys():
        if existing_email.lower() == email_to_find:
            user_found = True
            target_key = existing_email # Preserve the original key casing
            
            history_entry = {
                "id": datetime.now().timestamp(),
                "timestamp": datetime.now().strftime("%b %d, %H:%M"),
                "description": text,
                "topic": text[:40] + "...",
                "result": result_label,
                "confidence": f"{confidence}%"
            }

            if "history" not in users[target_key]:
                users[target_key]["history"] = []
            
            # Add to the beginning of the list
            users[target_key]["history"].insert(0, history_entry)
            users[target_key]["history"] = users[target_key]["history"][:15]
            
            save_users(users) # Save to users.json
            current_history = users[target_key]["history"]
            print(f"✅ SUCCESS: Saved scan for {email_to_find}")
            break

    if not user_found:
        print(f"⚠️ WARNING: Email '{email_to_find}' not found in users.json. No history saved.")

    return {
        "final_decision": result_label,
        "confidence": confidence,
        "history": current_history, # Sending this back ensures UI updates
        "battle_data": {
            "SVM (Kernel)": round(p_svm * 100, 1),
            "Naive Bayes": round(p_nb * 100, 1),
            "Logistic Regression": round(p_lr * 100, 1)
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)