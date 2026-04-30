from sqlalchemy.orm import Session
import models,schema,utils,auth
from fastapi import HTTPException

def registration(db:Session,details:schema.registration):
    username = db.query(models.User).filter(models.User.username == details.username).first()
    if username :
            raise HTTPException(status_code=404,detail= 'Username is already taken')
    user = models.User(
            username = details.username,
            password = details.hash_password(),
            email = details.email,
            address = details.address, 
            mobile_no = details.mobile_no 
        )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login(db:Session,details:schema.Login):
    username = utils.get_user(details.username,db)
    if username is not None:
        hashed_pass = username.hashed_password
    password = utils.pwd_verify(details.password,hashed_pass)
    access_token = auth.create_access_token(
        
    )
    
def verify():
     

