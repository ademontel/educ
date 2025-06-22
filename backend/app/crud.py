from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from . import models, schemas
from .schemas import UserRole
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import logging
from datetime import datetime, timedelta

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

def get_teachers(db: Session, skip: int = 0, limit: int = 100):
    """Obtener lista de usuarios con rol teacher/docente"""
    return db.query(models.User).filter(
        models.User.role.in_(['teacher', 'docente'])
    ).offset(skip).limit(limit).all()

def get_subjects(db: Session, skip: int = 0, limit: int = 100):
    """Obtener lista de materias disponibles"""
    return db.query(models.Subject).offset(skip).limit(limit).all()

def get_subject_by_id(db: Session, subject_id: int):
    """Obtener una materia por ID"""
    return db.query(models.Subject).filter(models.Subject.id == subject_id).first()

def create_subject(db: Session, subject_data: dict):
    """Crear una nueva materia"""
    db_subject = models.Subject(**subject_data)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def create_tutorship(db: Session, tutorship: schemas.TutorshipCreate):
    """Crear una nueva tutoría"""
    db_tutorship = models.Tutorship(**tutorship.dict())
    db.add(db_tutorship)
    db.commit()
    db.refresh(db_tutorship)
    
    # Recargar con datos relacionados para la respuesta
    return db.query(models.Tutorship).options(
        joinedload(models.Tutorship.student),
        joinedload(models.Tutorship.subject),
        joinedload(models.Tutorship.professor).joinedload(models.Professor.user)
    ).filter(models.Tutorship.id == db_tutorship.id).first()

# CRUD para disponibilidad de profesores
def create_teacher_availability(db: Session, availability: schemas.TeacherAvailabilityCreate):
    """Crear disponibilidad horaria para un profesor con validaciones"""
    from datetime import datetime, time
    
    # Validar que la hora de fin sea posterior a la de inicio
    start_time = datetime.strptime(availability.start_time, "%H:%M").time()
    end_time = datetime.strptime(availability.end_time, "%H:%M").time()
    
    if end_time <= start_time:
        raise HTTPException(
            status_code=400, 
            detail="La hora de fin debe ser posterior a la hora de inicio"
        )
    
    # Verificar conflictos de horario existentes
    existing_slots = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == availability.teacher_id,
        models.TeacherAvailability.day_of_week == availability.day_of_week
    ).all()
    
    for slot in existing_slots:
        slot_start = datetime.strptime(slot.start_time, "%H:%M").time()
        slot_end = datetime.strptime(slot.end_time, "%H:%M").time()
        
        # Verificar solapamiento
        if not (end_time <= slot_start or start_time >= slot_end):
            raise HTTPException(
                status_code=400,
                detail="Ya existe un horario que se solapa con el horario seleccionado"
            )
    
    db_availability = models.TeacherAvailability(**availability.dict())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability
    """Crear disponibilidad horaria para un profesor"""
    db_availability = models.TeacherAvailability(**availability.dict())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability

def get_teacher_availability(db: Session, teacher_id: int):
    """Obtener la disponibilidad horaria de un profesor"""
    return db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == teacher_id
    ).all()

def update_teacher_availability(db: Session, availability_id: int, availability: schemas.TeacherAvailabilityCreate):
    """Actualizar disponibilidad horaria con validaciones"""
    from datetime import datetime, time
    
    # Validar que la hora de fin sea posterior a la de inicio
    start_time = datetime.strptime(availability.start_time, "%H:%M").time()
    end_time = datetime.strptime(availability.end_time, "%H:%M").time()
    
    if end_time <= start_time:
        raise HTTPException(
            status_code=400, 
            detail="La hora de fin debe ser posterior a la hora de inicio"
        )
    
    # Verificar conflictos con otros horarios (excluyendo el actual)
    existing_slots = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == availability.teacher_id,
        models.TeacherAvailability.day_of_week == availability.day_of_week,
        models.TeacherAvailability.id != availability_id
    ).all()
    
    for slot in existing_slots:
        slot_start = datetime.strptime(slot.start_time, "%H:%M").time()
        slot_end = datetime.strptime(slot.end_time, "%H:%M").time()
        
        # Verificar solapamiento
        if not (end_time <= slot_start or start_time >= slot_end):
            raise HTTPException(
                status_code=400,
                detail="Ya existe un horario que se solapa con el horario seleccionado"
            )
    
    db_availability = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.id == availability_id
    ).first()
    
    if not db_availability:
        return None
    
    for key, value in availability.dict().items():
        setattr(db_availability, key, value)
    
    db.commit()
    db.refresh(db_availability)
    return db_availability
    """Actualizar disponibilidad horaria"""
    db_availability = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.id == availability_id
    ).first()
    
    if db_availability:
        for key, value in availability.dict().items():
            setattr(db_availability, key, value)
        db.commit()
        db.refresh(db_availability)
    
    return db_availability

def delete_teacher_availability(db: Session, availability_id: int):
    """Eliminar disponibilidad horaria"""
    db_availability = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.id == availability_id
    ).first()
    
    if db_availability:
        db.delete(db_availability)
        db.commit()
        return True
    return False

# CRUD para agenda de profesores
def create_teacher_schedule(db: Session, schedule: schemas.TeacherScheduleCreate):
    """Crear evento en el calendario del profesor"""
    db_schedule = models.TeacherSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def get_teacher_schedule(db: Session, teacher_id: int, start_date: datetime, end_date: datetime):
    """Obtener el calendario de un profesor en un rango de fechas"""
    return db.query(models.TeacherSchedule).filter(
        models.TeacherSchedule.teacher_id == teacher_id,
        models.TeacherSchedule.start_datetime >= start_date,
        models.TeacherSchedule.end_datetime <= end_date
    ).all()

def get_teacher_schedule_by_id(db: Session, schedule_id: int):
    """Obtener un evento específico del calendario del profesor por ID"""
    return db.query(models.TeacherSchedule).filter(
        models.TeacherSchedule.id == schedule_id
    ).first()

def update_teacher_schedule(db: Session, schedule_id: int, schedule: schemas.TeacherScheduleCreate):
    """Actualizar un evento en el calendario del profesor"""
    db_schedule = db.query(models.TeacherSchedule).filter(
        models.TeacherSchedule.id == schedule_id
    ).first()
    
    if db_schedule:
        for field, value in schedule.dict().items():
            setattr(db_schedule, field, value)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    return None

def delete_teacher_schedule(db: Session, schedule_id: int):
    """Eliminar un evento del calendario del profesor"""
    db_schedule = db.query(models.TeacherSchedule).filter(
        models.TeacherSchedule.id == schedule_id
    ).first()
    
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
        return True
    return False

def get_teacher_available_slots(db: Session, teacher_id: int, start_date: datetime, end_date: datetime, duration_minutes: int = 60):
    """Obtener slots disponibles de un profesor en un rango de fechas"""
    # Esta es una implementación básica - en una app real sería más compleja
    # Por ahora devuelve slots de ejemplo
    available_slots = []
    
    # Obtener disponibilidad del profesor
    availability = get_teacher_availability(db, teacher_id)
    
    # Obtener eventos bloqueados
    blocked_events = get_teacher_schedule(db, teacher_id, start_date, end_date)
    
    # Generar slots disponibles (implementación simplificada)
    current_date = start_date
    while current_date < end_date:
        # Agregar un slot de ejemplo por día
        slot_start = current_date.replace(hour=14, minute=0, second=0, microsecond=0)
        slot_end = slot_start + timedelta(minutes=duration_minutes)
        
        available_slots.append({
            "start_datetime": slot_start,
            "end_datetime": slot_end,
            "duration_minutes": duration_minutes
        })
        
        current_date += timedelta(days=1)
    
    return available_slots

# CRUD para materias del docente
def get_teacher_subjects(db: Session, teacher_id: int):
    """Obtener todas las materias asignadas a un docente"""
    # Verificar que el profesor existe en la tabla professors
    professor = db.query(models.Professor).filter(models.Professor.id == teacher_id).first()
    if not professor:
        # Si no existe en professors, crearlo automáticamente
        new_professor = models.Professor(id=teacher_id)
        db.add(new_professor)
        db.commit()
    
    return db.query(models.ProfessorSubject).options(
        joinedload(models.ProfessorSubject.subject)
    ).filter(models.ProfessorSubject.professor_id == teacher_id).all()

def add_subject_to_teacher(db: Session, teacher_id: int, subject_id: int):
    """Agregar una materia a un docente"""
    # Verificar que el profesor existe en la tabla professors
    professor = db.query(models.Professor).filter(models.Professor.id == teacher_id).first()
    if not professor:
        # Si no existe en professors, crearlo automáticamente
        new_professor = models.Professor(id=teacher_id)
        db.add(new_professor)
        db.commit()
    
    # Verificar que la materia existe
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        return None
    
    # Verificar que la relación no existe ya
    existing = db.query(models.ProfessorSubject).filter(
        models.ProfessorSubject.professor_id == teacher_id,
        models.ProfessorSubject.subject_id == subject_id
    ).first()
    
    if existing:
        return existing
    
    # Crear nueva relación
    db_teacher_subject = models.ProfessorSubject(
        professor_id=teacher_id,
        subject_id=subject_id
    )
    db.add(db_teacher_subject)
    db.commit()
    db.refresh(db_teacher_subject)
    
    # Retornar con datos relacionados
    return db.query(models.ProfessorSubject).options(
        joinedload(models.ProfessorSubject.subject)
    ).filter(models.ProfessorSubject.id == db_teacher_subject.id).first()

def remove_subject_from_teacher(db: Session, teacher_id: int, subject_id: int):
    """Eliminar una materia de un docente"""
    teacher_subject = db.query(models.ProfessorSubject).filter(
        models.ProfessorSubject.professor_id == teacher_id,
        models.ProfessorSubject.subject_id == subject_id
    ).first()
    
    if teacher_subject:
        db.delete(teacher_subject)
        db.commit()
        return True
    
    return False
