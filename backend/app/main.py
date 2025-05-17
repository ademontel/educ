from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .auth import get_current_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
from app.admin import setup_admin
setup_admin(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Set-Cookie", "Authorization"],
    expose_headers=["Set-Cookie"]
)

@app.get("/users/check-email/{email}")
def check_email(email: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email)
    return {"exists": db_user is not None}

@app.get("/users", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
    return {"exists": db_user is not None}

@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    updated = crud.update_user(db, user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from .auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from fastapi.responses import JSONResponse

@app.post("/login")
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # Verificar credenciales
    if not crud.verify_password(db, user_credentials.email, user_credentials.password):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )
    
    # Si las credenciales son correctas, obtener el usuario
    user = crud.get_user_by_email(db, user_credentials.email)
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Crear respuesta con cookie
    response = JSONResponse(content={"user": {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }})
    
    # Configurar cookie segura
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Cambiar a False en desarrollo local sin HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convertir minutos a segundos
    )
    
    return response

@app.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token")
    return response

@app.get("/check-auth")
async def check_auth(current_user = Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }