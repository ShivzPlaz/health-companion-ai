import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
import requests
import json
from datetime import datetime

import models
import database
import auth

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Allow frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama LLM endpoint — centralised so it only needs changing in one place
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")

class Message(BaseModel):
    role: str
    content: str
    images: Optional[List[str]] = None

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str

class ChatMessageRequest(BaseModel):
    content: str
    images: Optional[List[str]] = None

class DoctorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    specialty: str
    hospital: str
    rating: str
    image: Optional[str] = None

class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doctor: DoctorResponse
    date: str
    time: str
    status: str

class AppointmentCreate(BaseModel):
    doctor_id: int
    date: str
    time: str

class SymptomAnalysisRequest(BaseModel):
    symptoms: List[str]
    severity: str
    duration: str

class ReportAnalysisRequest(BaseModel):
    image: str

class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    dosage: str
    time: str
    taken: bool

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    time: str

class MedicationToggle(BaseModel):
    taken: bool

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

@app.post("/api/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, name=user.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@app.get("/api/users/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=UserResponse)
def update_user_me(user_update: UserUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if user_update.name is not None:
        current_user.name = user_update.name
        
    if user_update.email is not None and user_update.email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
        
    if user_update.password is not None and user_update.password.strip():
        current_user.hashed_password = auth.get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/api/chats", response_model=List[ChatResponse])
def get_chats(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Chat).filter(models.Chat.owner_id == current_user.id).all()

@app.post("/api/chats", response_model=ChatResponse)
def create_chat(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_chat = models.Chat(title="New Consultation", owner_id=current_user.id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@app.get("/api/chats/{chat_id}/messages", response_model=List[MessageResponse])
def get_messages(chat_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.owner_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return db.query(models.Message).filter(models.Message.chat_id == chat_id).all()

@app.post("/api/chats/{chat_id}/messages")
async def send_message(
    chat_id: int, 
    req: ChatMessageRequest, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.owner_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Update chat title if it's the first message
    existing_messages = db.query(models.Message).filter(models.Message.chat_id == chat_id).count()
    if existing_messages == 0:
        chat.title = req.content[:30] + "..." if len(req.content) > 30 else req.content
        db.commit()

    # Save user message
    user_msg = models.Message(chat_id=chat_id, role="user", content=req.content)
    db.add(user_msg)
    db.commit()

    # Fetch history for context
    history = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.id).all()
    
    SYSTEM_PROMPT = "You are MediMind, a helpful and professional AI healthcare assistant. Provide preliminary guidance, but always remind the user that you do not replace professional medical diagnosis."
    
    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        formatted_messages.append({"role": msg.role, "content": msg.content})
    
    # Append current message images if any
    if req.images and len(req.images) > 0:
        clean_images = [img.split(",")[1] if "," in img else img for img in req.images]
        formatted_messages[-1]["images"] = clean_images

    ollama_payload = {
        "model": "llama3.2-vision",
        "messages": formatted_messages,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=ollama_payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        ai_reply = data.get("message", {}).get("content", "I'm sorry, I couldn't generate a response.")
        
        # Save AI message
        ai_msg = models.Message(chat_id=chat_id, role="assistant", content=ai_reply)
        db.add(ai_msg)
        db.commit()
        
        return {"reply": ai_reply}
        
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Could not connect to Ollama. Make sure it is running locally.")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(database.get_db)):
    doctors = db.query(models.Doctor).all()
    if not doctors:
        # Seed dummy doctors
        dummy_doctors = [
            models.Doctor(name="Dr. Sarah Chen", specialty="Cardiologist", hospital="MediMind General", rating="4.9"),
            models.Doctor(name="Dr. James Wilson", specialty="General Physician", hospital="City Health Center", rating="4.7"),
            models.Doctor(name="Dr. Emily Patel", specialty="Dermatologist", hospital="Skin Care Institute", rating="4.8")
        ]
        db.bulk_save_objects(dummy_doctors)
        db.commit()
        doctors = db.query(models.Doctor).all()
    return doctors

@app.get("/api/appointments", response_model=List[AppointmentResponse])
def get_appointments(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()

@app.post("/api/appointments", response_model=AppointmentResponse)
def book_appointment(req: AppointmentCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_apt = models.Appointment(
        patient_id=current_user.id,
        doctor_id=req.doctor_id,
        date=req.date,
        time=req.time
    )
    db.add(new_apt)
    db.commit()
    db.refresh(new_apt)
    return new_apt

@app.delete("/api/appointments/{apt_id}")
def cancel_appointment(apt_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    apt = db.query(models.Appointment).filter(models.Appointment.id == apt_id, models.Appointment.patient_id == current_user.id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(apt)
    db.commit()
    return {"status": "cancelled"}

@app.get("/api/dashboard")
def get_dashboard_stats(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    chats = db.query(models.Chat).filter(models.Chat.owner_id == current_user.id).order_by(models.Chat.id.desc()).all()
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()
    
    current_month = datetime.now().strftime("%b")
    trend = [
        {"month": "Jan", "consultations": 2},
        {"month": "Feb", "consultations": 3},
        {"month": "Mar", "consultations": 1},
        {"month": "Apr", "consultations": 4},
        {"month": "May", "consultations": 5},
        {"month": "Jun", "consultations": 3},
        {"month": current_month, "consultations": len(chats)}
    ]
    
    recent_chats = [{"title": c.title, "date": "Recent"} for c in chats[:3]]
    
    next_apt = None
    if appointments:
        apt = appointments[-1]
        doc = db.query(models.Doctor).filter(models.Doctor.id == apt.doctor_id).first()
        next_apt = f"{doc.name}, {doc.specialty}" if doc else "Upcoming"

    return {
        "user_name": current_user.name,
        "total_consultations": len(chats),
        "next_appointment": next_apt or "None scheduled",
        "trend": trend,
        "recent_consultations": recent_chats
    }

@app.post("/api/symptoms/analyze")
async def analyze_symptoms(req: SymptomAnalysisRequest, current_user: models.User = Depends(auth.get_current_user)):
    OLLAMA_URL_LOCAL = OLLAMA_URL
    
    prompt = f"""
    The patient is experiencing the following symptoms: {', '.join(req.symptoms)}.
    The severity is {req.severity} and duration is {req.duration}.
    
    Provide a preliminary medical analysis. You must respond ONLY with a valid JSON object matching this exact schema:
    {{
      "causes": [
        {{"label": "string (name of possible cause)", "note": "string (probability or brief detail)"}}
      ],
      "precautions": [
        {{"label": "string (precaution action)"}}
      ],
      "medicines": [
        {{"label": "string (generic medicine name)", "note": "string (purpose)"}}
      ],
      "specialist": [
        {{"label": "string (type of doctor)", "note": "string (urgency)"}}
      ]
    }}
    Do not include any other text, markdown formatting like ```json, or greetings. Just output the raw JSON object.
    """
    
    ollama_payload = {
        "model": "llama3.2-vision",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_URL_LOCAL, json=ollama_payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        reply_content = data.get("message", {}).get("content", "").strip()
        
        # Clean up markdown if model still output it
        if reply_content.startswith("```json"):
            reply_content = reply_content[7:]
        if reply_content.endswith("```"):
            reply_content = reply_content[:-3]
            
        parsed_data = json.loads(reply_content.strip())
        return parsed_data
    except Exception as e:
        print(f"Symptom Analysis Error: {e}")
        # Return fallback on error
        return {
            "causes": [{"label": "Could not determine", "note": "Please consult a doctor."}],
            "precautions": [{"label": "Rest and hydrate"}],
            "medicines": [{"label": "Consult pharmacist", "note": ""}],
            "specialist": [{"label": "General Practitioner", "note": "Soon"}]
        }

@app.post("/api/reports/analyze")
async def analyze_report(req: ReportAnalysisRequest, current_user: models.User = Depends(auth.get_current_user)):
    OLLAMA_URL_LOCAL = OLLAMA_URL
    
    prompt = """
    You are a medical expert analyzing a lab report or medical document.
    Extract the key findings from this image and explain them in simple terms that a patient can understand.
    Highlight any abnormal values and what they might mean.
    Provide your response in markdown format, keeping it clear, concise, and structured.
    """
    
    clean_image = req.image.split(",")[1] if "," in req.image else req.image
    
    ollama_payload = {
        "model": "llama3.2-vision",
        "messages": [
            {
                "role": "user", 
                "content": prompt,
                "images": [clean_image]
            }
        ],
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_URL_LOCAL, json=ollama_payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        reply_content = data.get("message", {}).get("content", "Could not analyze the report.")
        return {"analysis": reply_content}
    except Exception as e:
        print(f"Report Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze report.")

@app.get("/api/medications", response_model=List[MedicationResponse])
def get_medications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Medication).filter(models.Medication.patient_id == current_user.id).all()

@app.post("/api/medications", response_model=MedicationResponse)
def add_medication(req: MedicationCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    med = models.Medication(
        patient_id=current_user.id,
        name=req.name,
        dosage=req.dosage,
        time=req.time,
        taken=False
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med

@app.put("/api/medications/{med_id}", response_model=MedicationResponse)
def toggle_medication(med_id: int, req: MedicationToggle, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    med = db.query(models.Medication).filter(models.Medication.id == med_id, models.Medication.patient_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    med.taken = req.taken
    db.commit()
    db.refresh(med)
    return med

@app.get("/api/export")
def export_health_data(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    chats = db.query(models.Chat).filter(models.Chat.owner_id == current_user.id).all()
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()
    medications = db.query(models.Medication).filter(models.Medication.patient_id == current_user.id).all()
    
    report = f"# Health Summary Report for {current_user.name}\n"
    report += f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    report += "## Medications\n"
    if not medications:
        report += "No medications listed.\n"
    else:
        for m in medications:
            report += f"- {m.name} ({m.dosage}) at {m.time} - {'Taken' if m.taken else 'Pending'}\n"
            
    report += "\n## Upcoming Appointments\n"
    if not appointments:
        report += "No upcoming appointments.\n"
    else:
        for a in appointments:
            doc = db.query(models.Doctor).filter(models.Doctor.id == a.doctor_id).first()
            report += f"- {a.date} at {a.time} with Dr. {doc.name if doc else 'Unknown'}\n"
            
    report += "\n## Recent AI Consultations\n"
    if not chats:
        report += "No recent consultations.\n"
    else:
        for c in chats[-5:]:
            report += f"- {c.title}\n"
            
    return {"report": report}

@app.get("/")
def root():
    return {"status": "ok", "message": "MediMind AI Backend is running."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
