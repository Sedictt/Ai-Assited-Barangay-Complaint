from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# 1️⃣ Load model & vectorizer
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# 2️⃣ Initialize FastAPI
app = FastAPI(title="Barangay Complaint AI")

# 3️⃣ Define request format
class ComplaintRequest(BaseModel):
    message: str

# 4️⃣ Define the AI endpoint
@app.post("/analyze")
def analyze_complaint(request: ComplaintRequest):
    # Convert text to TF-IDF
    X = vectorizer.transform([request.message])
    
    # Predict category
    category = model.predict(X)[0]
    
    # Optional: assign priority scores based on category
    priority_dict = {
        "violence": 5,
        "fire_hazard": 5,
        "noise": 2,
        "sanitation": 3,
        "waste": 2
    }
    priority = priority_dict.get(category, 1)
    
    # Suggested action
    actions = {
        5: "Immediate barangay intervention",
        4: "Contact appropriate authorities ASAP",
        3: "Schedule inspection within 24 hours",
        2: "Issue warning / follow-up later",
        1: "Monitor situation"
    }
    recommended_action = actions.get(priority, "Check complaint manually")
    
    return {
        "category": category,
        "priority": priority,
        "recommended_action": recommended_action
    }
