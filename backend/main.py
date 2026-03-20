from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
import re
import json
import nltk
import numpy as np
from datetime import datetime
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import uvicorn

# --- INITIALIZATION ---
# [cite: 111] Using FastAPI for API creation as specified in requirements.
app = FastAPI(title="JobGuard Pro: Hybrid ML + Heuristic Engine")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# [cite: 113, 492] While the report mentions SQLite, your current logic uses JSON for simplicity.
# To match the report's ER-diagram, you may later migrate this to a .db file.
DB_FILE  = os.path.join(BASE_DIR, "users.json")
MODELS_PATH = os.path.join(BASE_DIR, "model")

# --- DATABASE LOGIC ---
def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({}, f)

def get_all_users():
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

init_db()

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NLTK & PREPROCESSING ---
# [cite: 137, 138, 139] Preprocessing: removing noise, stopwords, and applying lemmatization.
def setup_nltk():
    global stop_words, lemmatizer
    for pkg in ['stopwords', 'wordnet']:
        try:
            nltk.download(pkg, quiet=True)
        except Exception as e:
            print(f"NLTK Download Warning: {e}")
    
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()

setup_nltk()

def clean_text(raw_text):
    # [cite: 138] Standardizing by removing non-alphabetic characters and lowercasing.
    text = re.sub(r'[^a-zA-Z0-9]', ' ', str(raw_text))
    text = text.lower().split()
    text = [lemmatizer.lemmatize(word) for word in text if word not in stop_words]
    return " ".join(text)

# --- HEURISTIC LOGIC (Safety Layer) ---
# [cite: 205, 206] Fixed logical rules to check for "economic impossibilities" like high salaries.
def check_heuristics(raw_text):
    text_lower = raw_text.lower()
    
    # Detect suspiciously high salary patterns (e.g., > 150,000)
    numbers = re.findall(r'\d+(?:,\d+)*', text_lower)
    for n in numbers:
        try:
            val = int(n.replace(',', ''))
            if val >= 150000:
                return 0.98
        except ValueError:
            continue
            
    # Pattern: High-level roles requiring no experience
    if "ceo" in text_lower and ("no experience" in text_lower or "freshers" in text_lower):
        return 0.99
        
    return None

# --- MODEL LOADING ---
# [cite: 11, 155] Loading the Hybrid Ensemble: SVM, Naive Bayes, and Logistic Regression.
models_loaded = False
tfidf = svm_model = nb_model = lr_model = None

try:
    with open(os.path.join(MODELS_PATH, "tfidf_vectorizer.pkl"), 'rb') as f:
        tfidf = pickle.load(f)
    with open(os.path.join(MODELS_PATH, "svm_model.pkl"), 'rb') as f:
        svm_model = pickle.load(f)
    with open(os.path.join(MODELS_PATH, "naive_bayes_model.pkl"), 'rb') as f:
        nb_model = pickle.load(f)
    with open(os.path.join(MODELS_PATH, "logistic_regression_model.pkl"), 'rb') as f:
        lr_model = pickle.load(f)
    
    models_loaded = True
    print("✅ HYBRID SYSTEM ONLINE: Ensemble + Heuristics Active.")
except Exception as e:
    print(f"❌ LOAD ERROR: Check if your .pkl files exist in /model/ directory. Error: {e}")

# --- SCHEMAS ---
class JobInput(BaseModel):
    description: str
    email: str

class UserAuth(BaseModel):
    email: str
    password: str
    full_name: str = ""

# --- API ENDPOINTS ---

# [cite: 452, 486] Endpoint for User Registration.
@app.post("/signup")
async def signup(user: UserAuth):
    users = get_all_users()
    email_key = user.email.lower().strip()
    if email_key in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    users[email_key] = {
        "full_name": user.full_name,
        "password": user.password,
        "history": []
    }
    save_users(users)
    return {"message": "User created successfully", "full_name": user.full_name}

# [cite: 452, 486] Endpoint for User Login with security check.
@app.post("/login")
async def login(user: UserAuth):
    users = get_all_users()
    email_key = user.email.lower().strip()
    
    if email_key not in users or users[email_key].get("password") != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "full_name": users[email_key].get("full_name", "User"),
        "email": email_key,
        "history": users[email_key].get("history", [])
    }

# [cite: 487, 488] Main Analysis Engine.
@app.post("/analyze")
async def analyze_job(data: JobInput):
    if not models_loaded:
        raise HTTPException(status_code=503, detail="AI Engine Offline")

    raw_text = data.description.strip()
    
    # STEP 1: ML Analysis (Ensemble Averaging) 
    cleaned = clean_text(raw_text)
    X_vec = tfidf.transform([cleaned])

    p_svm = float(svm_model.predict_proba(X_vec)[0][1])
    p_nb  = float(nb_model.predict_proba(X_vec)[0][1])
    p_lr  = float(lr_model.predict_proba(X_vec)[0][1])

    ai_prob = (p_svm + p_nb + p_lr) / 3

    # STEP 2: Heuristic Check [cite: 205]
    h_score = check_heuristics(raw_text)

    # STEP 3: Combine using Maximum Fusion 
    final_fake_prob = max(ai_prob, h_score) if h_score else ai_prob

    # STEP 4: Directional Confidence Logic [cite: 203, 210]
    if final_fake_prob >= 0.50:
        result_label = "FAKE"
        confidence = round(final_fake_prob * 100, 2)
        conf_color = "#dc3545" # Red for FAKE 
    else:
        result_label = "GENUINE"
        confidence = round((1 - final_fake_prob) * 100, 2)
        conf_color = "#198754" # Green for GENUINE 

    # STEP 5: History Logging [cite: 452, 497]
    users = get_all_users()
    email_key = data.email.lower().strip()
    history_entry = {
        "id": datetime.now().timestamp(),
        "timestamp": datetime.now().strftime("%b %d, %H:%M"),
        "description": raw_text[:120] + "...",
        "result": result_label,
        "confidence": f"{confidence}%"
    }

    if email_key in users:
        if "history" not in users[email_key]: 
            users[email_key]["history"] = []
        users[email_key]["history"].insert(0, history_entry)
        users[email_key]["history"] = users[email_key]["history"][:10]
        save_users(users)

    return {
        "final_decision": f"DETECTED {result_label}",
        "result_label": result_label,
        "confidence": confidence,
        "confidence_color": conf_color,
        "battle_data": {
            "SVM (Kernel)": round(p_svm * 100, 1),
            "Naive Bayes": round(p_nb * 100, 1),
            "Logistic Regression": round(p_lr * 100, 1),
            "Heuristic Layer": "FLAGGED" if h_score else "PASSED"
        },
        "history": users.get(email_key, {}).get("history", [])
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)