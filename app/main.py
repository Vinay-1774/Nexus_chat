from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from auth import create_access_token, verify_token
import schema,models,utils,database,crud
from typing import List

database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
token_bearer = OAuth2PasswordBearer(tokenUrl = 'Login')

def get_db():
    db = database.session()
    try: 
        yield db
    finally:
        db.close()

@app.post('/register',response_model=schema.Delete_user)
def registration(details:schema.registration,db:Session=Depends(get_db)):
    user = crud.registration(db,details)
    return user

@app.post('/Login')
def login(form_data:OAuth2PasswordRequestForm = Depends(),db:Session = Depends(get_db)):
    username = utils.get_user(form_data.username,db)
    if not username:
         raise HTTPException(status_code=409, detail="Invalid credentials")
    password = utils.pwd_verify(form_data.password,username.password) 
    if not password:
        raise HTTPException(status_code=401,detail='Wrong password')
    access_token  = create_access_token(data={
        'sub':form_data.username})
    return {'access_token': access_token, 'token_type': 'bearer'}

@app.get('/verify',response_model = schema.UserResponse)
def verify(token:str = Depends(token_bearer),db:Session = Depends(get_db)):
    verified_username = verify_token(token)
    data = db.query(models.User).filter(models.User.username == verified_username).first()
    return data

@app.get('/users',response_model = List[schema.Delete_user])
def get_users(db:Session = Depends(get_db)):
    return db.query(models.User).all()