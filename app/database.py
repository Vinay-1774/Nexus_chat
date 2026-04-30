from sqlalchemy import create_engine 
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

url = settings.DATABASE_URL
engine = create_engine(url)

session = sessionmaker(bind = engine,autoflush=False,autocommit = False)

Base = declarative_base()

def get_db():
    db = session()
    try: 
        yield db
    finally:
        db.close()