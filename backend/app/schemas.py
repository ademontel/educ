from pydantic import BaseModel, EmailStr, Field, constr
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    # Password requerido solo para crear nuevos usuarios
    password: constr(min_length=6) = Field(..., description="Password must be at least 6 characters long")

class User(UserBase):
    id: int
    # Password opcional en las respuestas
    password: Optional[str] = None

    class Config:
        orm_mode = True