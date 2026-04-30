from sqlalchemy import Column,String,Integer
from database import Base


class User(Base):
    __tablename__ = 'User_details'
    id = Column(Integer,primary_key = True,index = True)
    username = Column(String,unique=True,index= True)
    password = Column(String)
    email = Column(String,unique = True,index=True)
    address = Column(String)
    mobile_no = Column(String,unique = True)

