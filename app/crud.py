from sqlalchemy.orm import Session
import models,schema,utils,auth
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm

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
    return access_token
    
def verify(token:str,db:Session):
    verified_username = auth.verify_token(token)
    data = db.query(models.User).filter(models.User.username == verified_username).first()
    return data