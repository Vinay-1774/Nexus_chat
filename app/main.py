from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from auth import verify_token_cookies
import schema, database, crud
from pathlib import Path


database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve frontend directory path (plain HTML/CSS/JS — no build step needed)
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
print(f"Frontend directory: {FRONTEND_DIR}")
print(f"Frontend exists: {FRONTEND_DIR.is_dir()}")

# OAuth2 scheme
token_bearer = OAuth2PasswordBearer(tokenUrl="/login")

# ---- Static Files Routes ----
@app.get("/static/styles.css", include_in_schema=False)
async def serve_styles():
    style_file = FRONTEND_DIR / "styles.css"
    if style_file.exists():
        return FileResponse(str(style_file), media_type="text/css", headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return {"error": "styles.css not found"}

@app.get("/static/app.js", include_in_schema=False)
async def serve_app_js():
    app_file = FRONTEND_DIR / "app.js"
    if app_file.exists():
        return FileResponse(str(app_file), media_type="application/javascript", headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return {"error": "app.js not found"}

# ---- API Routes ----

@app.post("/register", response_model=schema.Delete_user)
def registration(details: schema.registration, db: Session = Depends(database.get_db)):
    user = crud.registration(db, details)
    return user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    response = crud.login(form_data, db)
    return response 

@app.get("/verify", response_model=schema.UserResponse)
def verify(username: str = Depends(verify_token_cookies), db: Session = Depends(database.get_db)):
    data = crud.verify(username, db)
    return data

@app.post('/log-out')
def log_out():
   return crud.log_out()

# Serve index.html at root
@app.get("/", include_in_schema=False)
async def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    print(f"Serving index.html from: {index_file}")
    if index_file.exists():
        return FileResponse(str(index_file), media_type="text/html", headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return {"error": "Frontend not found"}