from sqlalchemy.orm import Session
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password):
        return pwd_context.hash(password)

def get_user(username: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    return user

def pwd_verify(plain, hashed):
    return pwd_context.verify(plain, hashed)
