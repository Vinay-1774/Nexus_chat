from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from auth import create_access_token, verify_token
import schema, database, crud
from pathlib import Path


database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve frontend directory path (plain HTML/CSS/JS — no build step needed)
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# OAuth2 scheme
token_bearer = OAuth2PasswordBearer(tokenUrl="/login")

# ---- API Routes ----

@app.post("/register", response_model=schema.Delete_user)
def registration(details: schema.registration, db: Session = Depends(database.get_db)):
    user = crud.registration(db, details)
    return user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    access_token = crud.login(form_data, db)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/verify", response_model=schema.UserResponse)
def verify(token: str = Depends(token_bearer), db: Session = Depends(database.get_db)):
    data = crud.verify(token, db)
    return data

# ---- Static Files and Frontend Serving ----

# Serve JS, CSS, images from the frontend folder at /static
if FRONTEND_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="frontend_static")

# Serve index.html at root — visit http://127.0.0.1:8000
@app.get("/")
async def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not found. Check the frontend directory."}