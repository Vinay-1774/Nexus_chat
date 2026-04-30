from fastapi import FastAPI, Depends, HTTPException,WebSocket
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from auth import create_access_token, verify_token
import schema,models,database,crud
from typing import List
from pathlib import Path


database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve frontend directory path
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

token_bearer = OAuth2PasswordBearer(tokenUrl = 'Login')

# ---- Serve frontend at root ----
@app.get('/')
def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.post('/register',response_model=schema.Delete_user)
def registration(details:schema.registration,db:Session=Depends(database.get_db)):
    user = crud.registration(db,details)
    return user

@app.post('/Login')
def login(form_data:OAuth2PasswordRequestForm = Depends(),db:Session = Depends(database.get_db)):
    access_token  = crud.login(form_data,db)
    return {'access_token': access_token, 'token_type': 'bearer'}

@app.get('/verify',response_model = schema.UserResponse)
def verify(token:str = Depends(token_bearer),db:Session = Depends(database.get_db)):
    data =crud.verify(token,db)
    return data

# Mount static files AFTER all API routes so they don't shadow API endpoints
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="static")