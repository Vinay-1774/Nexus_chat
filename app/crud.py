from sqlalchemy.orm import Session
import models, schema, utils, auth
from config import settings
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse 

def registration(db:Session,details:schema.registration):
    username = db.query(models.User).filter(models.User.username == details.username).first()
    if username :
            raise HTTPException(status_code=404,detail= 'Username is already taken')
    user = models.User(
            username = details.username,
            password = utils.hash_password(details.password),
            email = details.email,
            address = details.address, 
            mobile_no = details.mobile_no 
        )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login(form_data:OAuth2PasswordRequestForm,db:Session):
    username = utils.get_user(form_data.username,db)
    if not username:
         raise HTTPException(status_code=409, detail="Invalid credentials")
    password = utils.pwd_verify(form_data.password,username.password) 
    if not password:
        raise HTTPException(status_code=401,detail='Wrong password')
    access_token  = auth.create_access_token(data={
        'sub':form_data.username})
    response = JSONResponse(content = {'message':'Login successfully'})
    response.set_cookie(
        key = 'access_token',
        value = access_token,
        httponly = True,
        secure = True,
        samesite = 'lax',
        max_age = settings.ACCESS_TOKEN_EXPIRY_MINUTES * 60
        
    )
    return response

def log_out():
    response = JSONResponse(content={'message':'Logged-out'})
    response.delete_cookie('access_token')
    return response

def verify(v_username:str,db:Session):
    data = db.query(models.User).filter(models.User.username == v_username).first()
    return data 