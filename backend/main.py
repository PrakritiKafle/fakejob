import os
import re
import json
import joblib
import nltk
import uvicorn
import unicodedata
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# --- INITIALIZATION ---
app = FastAPI(title="JobGuard Pro: Advanced Stacking System")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "users.json")
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
def setup_nltk():
    global stop_words, lemmatizer, english_vocab
    for pkg in ['stopwords', 'wordnet', 'words']:
        nltk.download(pkg, quiet=True)
    
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    try:
        english_vocab = set(w.lower() for w in nltk.corpus.words.words())
    except:
        english_vocab = set()

setup_nltk()

def clean_text_with_masking(raw_text):
    text = raw_text.lower()
    # Mask long digit strings (Phone numbers/IDs) to avoid confusing TF-IDF
    text = re.sub(r'\b\d{7,}\b', ' num_token ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    words = text.split()
    cleaned = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return " ".join(cleaned)

# --- HYBRID VALIDATION LAYER ---
def validate_job_content(raw_text):
   
    
    # PHASE 0: NORMALIZATION (Fixes the stylized font issue)
    normalized = unicodedata.normalize('NFKD', raw_text).encode('ascii', 'ignore').decode('ascii')
    text_lower = normalized.lower()
    # Extract words using a more robust pattern
    words = re.findall(r'\b\w+\b', text_lower)
    word_count = len(words)

    # 1. STRUCTURAL CHECK: Length
    # Most valid job ads need at least 15 words to describe a role
    if word_count < 15:
        return False, "Input too short to be a valid job description."

    # 2. FINANCIAL CHECK: Impossible Salary Detection
    # Catches Rs 50,000,000 or 9999999999 strings
    salary_patterns = re.findall(r'(?:salary|pay|rs|inr|npr|\$|€)\s?[:\-]?\s?([\d,]+)', text_lower)
    for s in salary_patterns:
        clean_s = s.replace(',', '') # Remove commas for calculation
        if len(clean_s) > 12:
            return False, "Unrealistic salary digits detected."
        try:
            val = int(clean_s)
            if val > 10000000: # 1 Crore / 10 Million limit
                return False, "Salary exceeds realistic system limits."
        except ValueError:
            continue

    # 3. EXPERIENCE CHECK: Unrealistic Experience Requirement
    # Scans for "X years", "X+ yrs" and rejects if > 30
    exp_patterns = re.findall(r'(\d+)\s*\+?\s*(?:years?|yrs?)', text_lower)
    for exp in exp_patterns:
        try:
            val = int(exp)
            if val > 30:
                return False, "Unrealistic experience requirement detected."
        except ValueError:
            continue

    # 4. RELEVANCE CHECK: Job Domain Anchors
    # We look for professional terminology
    job_anchors = {
        'requirements', 'qualifications', 'responsibilities', 'experience',
        'skills', 'apply', 'hiring', 'description', 'benefits', 'role',
        'candidate', 'opportunity', 'salary', 'location', 'full-time', 
        'part-time', 'internship', 'cv', 'resume', 'send', 'email'
    }
    
    found_anchors = [w for w in words if w in job_anchors]
    # Check for unique anchors (must find at least 2 distinct keywords)
    if len(set(found_anchors)) < 2:
        return False, "Content lacks standard job advertisement keywords."

    # 4. SANITY CHECK: Gibberish Detection
    # Compares words against known English vocabulary + numbers
    if word_count > 0:
        meaningful_count = sum(1 for w in words if w in english_vocab or w.isdigit())
        valid_ratio = meaningful_count / word_count
        
        # If less than 25% of words are recognizable English, it's likely nonsense
        if valid_ratio < 0.25:
            return False, "Input detected as non-English or gibberish text."

    return True, "Valid"

# --- MODEL LOADING ---
models_loaded = False
tfidf_vectorizer = stacking_model = None

try:
    tfidf_vectorizer = joblib.load(os.path.join(MODELS_PATH, "tfidf_vectorizer.pkl"))
    stacking_model = joblib.load(os.path.join(MODELS_PATH, "job_fraud_stacking_model.pkl"))
    models_loaded = True
    print("✅ STACKING ENSEMBLE ONLINE")
except Exception as e:
    print(f"❌ LOAD ERROR: {e}")

# --- SCHEMAS ---
class JobInput(BaseModel):
    description: str
    email: str

class UserAuth(BaseModel):
    email: str
    password: str
    full_name: str = ""

# --- API ENDPOINTS ---

@app.post("/signup")
async def signup(user: UserAuth):
    users = get_all_users()
    email_key = user.email.lower().strip()
    if email_key in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[email_key] = {"full_name": user.full_name, "password": user.password, "history": []}
    save_users(users)
    return {"message": "User created successfully"}

@app.post("/login")
async def login(user: UserAuth):
    users = get_all_users()
    email_key = user.email.lower().strip()
    if email_key not in users or users[email_key].get("password") != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "message": "Login successful",
        "full_name": users[email_key].get("full_name", "User"),
        "email": email_key,
        "history": users[email_key].get("history", [])
    }

@app.post("/analyze")
async def analyze_job(data: JobInput):
    if not models_loaded:
        raise HTTPException(status_code=503, detail="AI Engine Offline")

    raw_text = data.description.strip()
    email_key = data.email.lower().strip()

    # Step 1: Hybrid Validation
    is_valid, message = validate_job_content(raw_text)
    if not is_valid:
        # Construct response for invalid input
        response_data = {
            "final_decision": f"INVALID: {message}",
            "result_label": "INVALID",
            "confidence": 0,
            "battle_data": {"Status": "FAILED", "Error": message},
        }
    else:
        # Step 2: ML Prediction
        cleaned = clean_text_with_masking(raw_text)
        X_vec = tfidf_vectorizer.transform([cleaned])
        prediction = stacking_model.predict(X_vec)[0]
        probs = stacking_model.predict_proba(X_vec)[0] 
        
        fake_prob = round(float(probs[1]) * 100, 2)
        genuine_prob = round(float(probs[0]) * 100, 2)

        result_label = "FAKE" if prediction == 1 else "GENUINE"
        confidence = fake_prob if prediction == 1 else genuine_prob

        response_data = {
            "final_decision": f"DETECTED {result_label}",
            "result_label": result_label,
            "confidence": confidence,
            "battle_data": {
                "Algorithm": "Stacking Ensemble",
                "Fake Signal": f"{fake_prob}%",
                "Genuine Signal": f"{genuine_prob}%",
                "Status": "VALIDATED"
            }
        }

    # Step 3: Global History Logging
    users = get_all_users()
    history_entry = {
        "id": datetime.now().timestamp(),
        "timestamp": datetime.now().strftime("%b %d, %H:%M"),
        "description": raw_text[:100] + "...",
        "result": response_data["result_label"],
        "confidence": f"{response_data['confidence']}%" if response_data["result_label"] != "INVALID" else "N/A"
    }

    if email_key in users:
        users[email_key].setdefault("history", []).insert(0, history_entry)
        users[email_key]["history"] = users[email_key]["history"][:10]
        save_users(users)

    response_data["history"] = users.get(email_key, {}).get("history", [])
    return response_data

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)