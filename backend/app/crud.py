from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    if not user.password or len(user.password) < 6:
        logger.error(f"Password validation failed for user {user.email}: Password must be at least 6 characters long")
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password
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
        
        db_user.name = user.name
        db_user.email = user.email
        db_user.password = user.password
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user