from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
import json

app = FastAPI(title="SID Form API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for prototype (can be swapped to MongoDB later)
FORMS_DB = {}

class FormSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    components: List[Dict[str, Any]] = []

class FormResponse(FormSchema):
    id: str

@app.get("/")
def read_root():
    return {"status": "SID Form API is running", "engine": "Form.io Schema Compatible"}

@app.post("/forms", response_model=FormResponse)
def create_form(form: FormSchema):
    form_id = str(uuid.uuid4())
    form_data = form.model_dump()
    form_data["id"] = form_id
    FORMS_DB[form_id] = form_data
    return form_data

@app.get("/forms/{form_id}", response_model=FormResponse)
def get_form(form_id: str):
    if form_id not in FORMS_DB:
        raise HTTPException(status_code=404, detail="Form not found")
    return FORMS_DB[form_id]

@app.put("/forms/{form_id}", response_model=FormResponse)
def update_form(form_id: str, form: FormSchema):
    if form_id not in FORMS_DB:
        raise HTTPException(status_code=404, detail="Form not found")
    form_data = form.model_dump()
    form_data["id"] = form_id
    FORMS_DB[form_id] = form_data
    return form_data
