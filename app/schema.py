from pydantic import Field, EmailStr, BaseModel, ConfigDict

class Login(BaseModel):
    username: str = Field(...)
    password: str = Field(..., min_length=8)

class registration(Login):
    mobile_no: str = Field(..., max_length=10, min_length=10,pattern=r'^[6-9]\d{9}$')
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
