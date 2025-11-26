from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load model and vectorizer
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

class ComplaintRequest(BaseModel):
    complaint_text: str

@app.post("/predict")
def predict(req: ComplaintRequest):
    vec = vectorizer.transform([req.complaint_text])
    pred = model.predict(vec)[0]
    return {
        "category": pred[0],
        "severity": pred[1],
        "recommended_priority": int(pred[2])
    }
