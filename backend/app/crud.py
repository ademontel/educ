from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from . import models, schemas
from .schemas import UserRole
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

    if not user.role:
        logger.error(f"User role missing for {user.email}")
        raise HTTPException(status_code=400, detail="El campo 'role' es obligatorio")    # Generar hash de la contraseña
    hashed_password = generate_password_hash(user.password)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Si el usuario es un teacher, crear automáticamente el perfil de profesor
    if user.role in ['teacher', 'docente']:
        db_professor = models.Professor(
            id=db_user.id,
            abstract="",
            picture="",
            ranking=0.0
        )
        db.add(db_professor)
        db.commit()
        db.refresh(db_professor)
    
    return db_user

def create_missing_professor_profiles(db: Session):
    """Crear perfiles de profesor para usuarios con rol teacher que no los tienen"""
    # Buscar usuarios con rol teacher que no tienen perfil de profesor
    teachers_without_profile = db.query(models.User).filter(
        models.User.role.in_(['teacher', 'docente']),
        ~models.User.id.in_(
            db.query(models.Professor.id).subquery()
        )
    ).all()
    
    created_count = 0
    for teacher in teachers_without_profile:
        db_professor = models.Professor(
            id=teacher.id,
            abstract="",
            picture="",
            ranking=0.0
        )
        db.add(db_professor)
        created_count += 1
    
    if created_count > 0:
        db.commit()
    
    return created_count

def update_user(db: Session, user_id: int, user: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    if not user.password or len(user.password) < 6:
        logger.error(f"Password validation failed for user ID {user_id}: Password must be at least 6 characters long")
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    if not user.role:
        logger.error(f"User role missing for update on user ID {user_id}")
        raise HTTPException(status_code=400, detail="El campo 'role' es obligatorio")

    # Generar hash de la nueva contraseña
    hashed_password = generate_password_hash(user.password)

    db_user.name = user.name
    db_user.email = user.email
    db_user.password = hashed_password
    db_user.role = user.role 

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

# CRUD para archivos de medios del docente
def create_teacher_media_file(db: Session, media_file: schemas.TeacherMediaFileCreate):
    db_media_file = models.TeacherMediaFile(**media_file.dict())
    db.add(db_media_file)
    db.commit()
    db.refresh(db_media_file)
    return db_media_file

def get_teacher_media_files(db: Session, teacher_id: int):
    return db.query(models.TeacherMediaFile).filter(
        models.TeacherMediaFile.teacher_id == teacher_id
    ).order_by(models.TeacherMediaFile.uploaded_at.desc()).all()

def get_teacher_media_file(db: Session, file_id: int, teacher_id: int):
    return db.query(models.TeacherMediaFile).filter(
        models.TeacherMediaFile.id == file_id,
        models.TeacherMediaFile.teacher_id == teacher_id
    ).first()

def delete_teacher_media_file(db: Session, file_id: int, teacher_id: int):
    db_file = get_teacher_media_file(db, file_id, teacher_id)
    if db_file:
        db.delete(db_file)
        db.commit()
    return db_file

def update_teacher_media_file_description(db: Session, file_id: int, teacher_id: int, description: str):
    db_file = get_teacher_media_file(db, file_id, teacher_id)
    if db_file:
        db_file.description = description
        db.commit()
        db.refresh(db_file)
    return db_file

# CRUD para tutorías
def get_teacher_tutorships(db: Session, teacher_id: int):
    """Obtener todas las tutorías de un profesor específico con información relacionada"""
    # El teacher_id es el mismo que el user_id y también el professor_id
    # porque en el modelo Professor, id = ForeignKey("users.id")
    return db.query(models.Tutorship).options(
        joinedload(models.Tutorship.student),
        joinedload(models.Tutorship.subject)
    ).filter(
        models.Tutorship.professor_id == teacher_id
    ).order_by(models.Tutorship.start_time.desc()).all()

def get_tutorship_by_id(db: Session, tutorship_id: int):
    """Obtener una tutoría específica por ID"""
    return db.query(models.Tutorship).filter(models.Tutorship.id == tutorship_id).first()

def update_tutorship_status(db: Session, tutorship_id: int, status: str):
    """Actualizar el estado de una tutoría"""
    db_tutorship = get_tutorship_by_id(db, tutorship_id)
    if db_tutorship:
        db_tutorship.status = status
        db.commit()
        db.refresh(db_tutorship)
        
        # Recargar con datos relacionados para la respuesta
        return db.query(models.Tutorship).options(
            joinedload(models.Tutorship.student),
            joinedload(models.Tutorship.subject)
        ).filter(models.Tutorship.id == tutorship_id).first()
    return db_tutorship
