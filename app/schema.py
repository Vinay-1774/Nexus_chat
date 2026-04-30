from pydantic import Field, EmailStr, BaseModel, ConfigDict
from database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class Login(BaseModel):
    username: str = Field(...)
    password: str = Field(..., min_length=8)

    def hash_password(self):
        return pwd_context.hash(self.password)


class registration(Login):
    mobile_no: str = Field(..., max_length=10, min_length=10)
    email: EmailStr
    address: str = Field(...)


class Delete_user(BaseModel):
    id: int
    username: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    username: str
    email: EmailStr
    mobile_no: str
