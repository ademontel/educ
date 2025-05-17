from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
from werkzeug.security import generate_password_hash, check_password_hash
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    if not user.password or len(user.password) < 6:
        logger.error(f"Password validation failed for user {user.email}: Password must be at least 6 characters long")
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    # Generar hash de la contraseña
    hashed_password = generate_password_hash(user.password)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        if not user.password or len(user.password) < 6:
            logger.error(f"Password validation failed for user ID {user_id}: Password must be at least 6 characters long")
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # Generar hash de la nueva contraseña
        hashed_password = generate_password_hash(user.password)
        
        db_user.name = user.name
        db_user.email = user.email
        db_user.password = hashed_password
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def verify_password(db: Session, email: str, password: str) -> bool:
    user = get_user_by_email(db, email)
    if not user:
        return False
    return check_password_hash(user.password, password)