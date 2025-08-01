from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from .auth import get_current_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta, datetime
from .schemas import UserRole
import os
import uuid
import shutil
from pathlib import Path

import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
from app.admin import setup_admin, fix_missing_professor_profiles
setup_admin(app)

# Arreglar perfiles de profesor faltantes al iniciar
fix_missing_professor_profiles()

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

@app.get("/users", response_model=list[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/teachers", response_model=list[schemas.UserOut])
def get_teachers(
    skip: int = 0, 
    limit: int = 100, 
    name: str = None,
    subject: str = None,
    level: str = None,
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Obtener lista de docentes disponibles con filtros opcionales"""
    try:
        # Usar función de búsqueda simplificada
        return crud.search_teachers(db, skip=skip, limit=limit, name=name, subject=subject, level=level)
    except Exception as e:
        # Log del error y usar función básica como fallback
        logging.error(f"Error en endpoint get_teachers: {str(e)}")
        return crud.get_teachers(db, skip=skip, limit=limit)

@app.get("/subjects", response_model=list[schemas.SubjectOut])
def get_subjects(skip: int = 0, limit: int = 100, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obtener lista de materias disponibles"""
    return crud.get_subjects(db, skip=skip, limit=limit)

@app.get("/users/{user_id}", response_model=schemas.UserOut)
def read_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validación de autorización:
    # - Usuarios pueden ver su propio perfil
    # - Profesores pueden ver perfiles de estudiantes
    # - Estudiantes pueden ver perfiles de profesores
    # - Admins pueden ver cualquier perfil
    
    if (current_user.id == user_id or        current_user.role == 'admin' or
        (current_user.role == 'teacher' and db_user.role in ['student', 'alumno']) or
        (current_user.role in ['student', 'alumno'] and db_user.role == 'teacher')):
        return db_user
    else:
        raise HTTPException(
            status_code=403, 
            detail="No tienes permisos para ver este perfil"
        )

@app.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(">>>>> role recibido:", user.role, type(user.role))  # DEBUG
    if not user.role:
        raise HTTPException(status_code=400, detail="El campo 'role' es obligatorio")

    if user.role not in schemas.UserRole.__members__:
        raise HTTPException(status_code=422, detail=f"Rol inválido: {user.role}")

    # Forzar conversión si es string
    if isinstance(user.role, str):
        try:
            user.role = UserRole(user.role)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Rol inválido: {user.role}")

    if not isinstance(user.role, UserRole):
        raise HTTPException(status_code=400, detail="El campo 'role' es obligatorio")

    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return crud.create_user(db, user)

@app.put("/users/{user_id}", response_model=schemas.UserOut)
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

@app.post("/admin/migrate-professor-profiles")
def migrate_professor_profiles(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear perfiles de profesor para usuarios con rol teacher que no los tienen"""
    # Solo admins pueden ejecutar esta migración
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Solo los administradores pueden ejecutar migraciones")
    
    created_count = crud.create_missing_professor_profiles(db)
    return {
        "message": f"Se crearon {created_count} perfiles de profesor",
        "created_count": created_count
    }

from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from .auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from fastapi.responses import JSONResponse

@app.post("/login")
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
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
            "email": user.email,
            "role": user.role
        }})
        
        # Configurar cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # Development setting
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

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
            "email": current_user.email,
            "role": current_user.role
        }
    }

# Configuración para archivos
UPLOAD_DIR = Path("uploads/teacher_media")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'jpg', 'jpeg', 'png', 'gif', 'bmp',
    'mp4', 'avi', 'mov', 'wmv', 'flv',
    'mp3', 'wav', 'aac', 'flac',
    'zip', 'rar', '7z', 'txt', 'webp'
}

def is_allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.post("/teachers/{teacher_id}/media", response_model=schemas.TeacherMediaFileOut)
async def upload_teacher_media(
    teacher_id: int,
    file: UploadFile = File(...),
    description: str = Form(""),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden subir archivos")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes subir archivos a tu propia biblioteca")
    
    # Verificar que el archivo es válido
    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    # Generar nombre único para el archivo
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Obtener información del archivo
        file_size = os.path.getsize(file_path)
        
        # Crear registro en la base de datos
        media_file_data = schemas.TeacherMediaFileCreate(
            teacher_id=teacher_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            description=description
        )
        
        db_media_file = crud.create_teacher_media_file(db, media_file_data)
        db_media_file.uploaded_at = datetime.now()
        db.commit()
        
        return db_media_file
        
    except Exception as e:
        # Si hay error, eliminar el archivo
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")

@app.get("/teachers/{teacher_id}/media", response_model=list[schemas.TeacherMediaFileOut])
def get_teacher_media_files(
    teacher_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden acceder a sus archivos")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes acceder a tu propia biblioteca")
    
    return crud.get_teacher_media_files(db, teacher_id)

@app.get("/teachers/{teacher_id}/media/{file_id}")
def download_teacher_media_file(
    teacher_id: int,
    file_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar permisos
    if current_user.role not in ['teacher', 'student', 'alumno']:
        raise HTTPException(status_code=403, detail="Sin permisos para descargar archivos")
    
    # Los docentes solo pueden acceder a sus propios archivos
    # Los estudiantes pueden acceder a archivos de sus docentes (esto se puede expandir más tarde)
    if current_user.role == 'teacher' and current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes acceder a tu propia biblioteca")
    
    media_file = crud.get_teacher_media_file(db, file_id, teacher_id)
    if not media_file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    file_path = Path(media_file.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado en el servidor")
    
    return FileResponse(
        path=file_path,
        filename=media_file.original_filename,
        media_type=media_file.mime_type
    )

@app.delete("/teachers/{teacher_id}/media/{file_id}")
def delete_teacher_media_file(
    teacher_id: int,
    file_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden eliminar archivos")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes eliminar archivos de tu propia biblioteca")
    
    media_file = crud.get_teacher_media_file(db, file_id, teacher_id)
    if not media_file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Eliminar archivo del sistema
    file_path = Path(media_file.file_path)
    if file_path.exists():
        os.remove(file_path)
    
    # Eliminar registro de la base de datos
    crud.delete_teacher_media_file(db, file_id, teacher_id)
    
    return {"detail": "Archivo eliminado exitosamente"}

@app.put("/teachers/{teacher_id}/media/{file_id}/description")
def update_media_file_description(
    teacher_id: int,
    file_id: int,
    description: str = Form(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden editar archivos")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes editar archivos de tu propia biblioteca")
    
    updated_file = crud.update_teacher_media_file_description(db, file_id, teacher_id, description)
    if not updated_file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return updated_file

@app.get("/teachers/{teacher_id}/tutorships", response_model=list[schemas.TutorshipDetailOut])
def get_teacher_tutorships(
    teacher_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden ver sus tutorías")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes ver tus propias tutorías")
    
    return crud.get_teacher_tutorships(db, teacher_id)

@app.put("/teachers/{teacher_id}/tutorships/{tutorship_id}/status", response_model=schemas.TutorshipDetailOut)
def update_tutorship_status(
    teacher_id: int,
    tutorship_id: int,
    status_update: schemas.TutorshipStatusUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden actualizar el estado de las tutorías")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes actualizar tus propias tutorías")
    
    # Verificar que la tutoría existe y pertenece al docente
    tutorship = crud.get_tutorship_by_id(db, tutorship_id)
    if not tutorship:
        raise HTTPException(status_code=404, detail="Tutoría no encontrada")
    
    if tutorship.professor_id != teacher_id:
        raise HTTPException(status_code=403, detail="Esta tutoría no te pertenece")
    
    # Actualizar el estado
    updated_tutorship = crud.update_tutorship_status(db, tutorship_id, status_update.status)
    if not updated_tutorship:
        raise HTTPException(status_code=400, detail="No se pudo actualizar el estado de la tutoría")
    
    return updated_tutorship

@app.post("/tutorships", response_model=schemas.TutorshipDetailOut)
def create_tutorship(
    tutorship: schemas.TutorshipCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear una nueva tutoría"""
    # Verificar que el usuario autenticado es un estudiante
    if current_user.role not in ['student', 'alumno']:
        raise HTTPException(status_code=403, detail="Solo los estudiantes pueden crear tutorías")
    
    # Verificar que el student_id en los datos coincide con el usuario actual
    if tutorship.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes crear tutorías para ti mismo")
    
    # Verificar que el profesor existe
    professor = crud.get_user(db, tutorship.professor_id)
    if not professor or professor.role != 'teacher':
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    
    # Verificar que la materia existe
    subject = db.query(models.Subject).filter(models.Subject.id == tutorship.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    
    return crud.create_tutorship(db, tutorship)

# Endpoints para el sistema de agenda de docentes

@app.post("/teachers/{teacher_id}/availability", response_model=schemas.TeacherAvailabilityOut)
def create_teacher_availability(
    teacher_id: int,
    availability: schemas.TeacherAvailabilityBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear disponibilidad horaria para un docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden configurar su disponibilidad")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes configurar tu propia disponibilidad")
    
    availability_data = schemas.TeacherAvailabilityCreate(
        teacher_id=teacher_id,
        **availability.dict()
    )
    
    return crud.create_teacher_availability(db, availability_data)

@app.get("/teachers/{teacher_id}/availability", response_model=list[schemas.TeacherAvailabilityOut])
def get_teacher_availability(
    teacher_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener la disponibilidad horaria de un docente"""
    return crud.get_teacher_availability(db, teacher_id)

@app.put("/teachers/{teacher_id}/availability/{availability_id}", response_model=schemas.TeacherAvailabilityOut)
def update_teacher_availability(
    teacher_id: int,
    availability_id: int,
    availability: schemas.TeacherAvailabilityBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar disponibilidad horaria de un docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden configurar su disponibilidad")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes configurar tu propia disponibilidad")
    
    availability_data = schemas.TeacherAvailabilityCreate(
        teacher_id=teacher_id,
        **availability.dict()
    )
    
    updated_availability = crud.update_teacher_availability(db, availability_id, availability_data)
    if not updated_availability:
        raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")
    
    return updated_availability

@app.delete("/teachers/{teacher_id}/availability/{availability_id}")
def delete_teacher_availability(
    teacher_id: int,
    availability_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar disponibilidad horaria de un docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden configurar su disponibilidad")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes configurar tu propia disponibilidad")
    
    deleted_availability = crud.delete_teacher_availability(db, availability_id)
    if not deleted_availability:
        raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")
    
    return {"message": "Disponibilidad eliminada correctamente"}

@app.get("/teachers/{teacher_id}/available-slots", response_model=schemas.TeacherAvailabilityResponse)
def get_teacher_available_slots(
    teacher_id: int,
    start_date: str,  # Formato: YYYY-MM-DD
    end_date: str,    # Formato: YYYY-MM-DD
    duration: int = 60,  # Duración en minutos
    db: Session = Depends(get_db)
):
    """Obtener slots disponibles de un docente en un rango de fechas"""
    try:
        start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        end_datetime = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    
    # Obtener información del docente
    teacher = crud.get_user(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    
    # Obtener slots disponibles
    available_slots = crud.get_teacher_available_slots(db, teacher_id, start_datetime, end_datetime, duration)
    
    return schemas.TeacherAvailabilityResponse(
        teacher_id=teacher_id,
        teacher_name=teacher.name,
        available_slots=[schemas.AvailableSlot(**slot) for slot in available_slots]
    )

@app.post("/teachers/{teacher_id}/schedule", response_model=schemas.TeacherScheduleOut)
def create_teacher_schedule(
    teacher_id: int,
    schedule: schemas.TeacherScheduleBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear un evento en el calendario del docente (bloquear tiempo)"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden gestionar su calendario")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes gestionar tu propio calendario")
    
    schedule_data = schemas.TeacherScheduleCreate(
        teacher_id=teacher_id,
        **schedule.dict()
    )
    
    return crud.create_teacher_schedule(db, schedule_data)

@app.get("/teachers/{teacher_id}/schedule", response_model=list[schemas.TeacherScheduleOut])
def get_teacher_schedule(
    teacher_id: int,
    start_date: str,  # Formato: YYYY-MM-DD
    end_date: str,    # Formato: YYYY-MM-DD
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener el calendario de un docente en un rango de fechas"""
    try:
        start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        end_datetime = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    
    return crud.get_teacher_schedule(db, teacher_id, start_datetime, end_datetime)

@app.put("/teachers/{teacher_id}/schedule/{schedule_id}", response_model=schemas.TeacherScheduleOut)
def update_teacher_schedule(
    teacher_id: int,
    schedule_id: int,
    schedule: schemas.TeacherScheduleBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar un evento en el calendario del docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden gestionar su calendario")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes gestionar tu propio calendario")
    
    # Verificar que el evento existe y pertenece al docente
    existing_schedule = crud.get_teacher_schedule_by_id(db, schedule_id)
    if not existing_schedule:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    if existing_schedule.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este evento")
    
    schedule_data = schemas.TeacherScheduleCreate(
        teacher_id=teacher_id,
        **schedule.dict()
    )
    
    return crud.update_teacher_schedule(db, schedule_id, schedule_data)

@app.delete("/teachers/{teacher_id}/schedule/{schedule_id}")
def delete_teacher_schedule(
    teacher_id: int,
    schedule_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar un evento del calendario del docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden gestionar su calendario")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes gestionar tu propio calendario")
    
    # Verificar que el evento existe y pertenece al docente
    existing_schedule = crud.get_teacher_schedule_by_id(db, schedule_id)
    if not existing_schedule:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    if existing_schedule.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este evento")
    
    success = crud.delete_teacher_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=400, detail="Error al eliminar el evento")
    
    return {"message": "Evento eliminado exitosamente"}

# Endpoints para materias del docente
@app.get("/teachers/{teacher_id}/subjects", response_model=list[schemas.TeacherSubjectOut])
def get_teacher_subjects(
    teacher_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener todas las materias asignadas a un docente"""
    # Los usuarios autenticados pueden ver las materias de cualquier docente
    # para facilitar la búsqueda de tutores
    
    # Verificar que el teacher_id corresponde a un docente válido
    teacher = crud.get_user(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    
    if teacher.role != 'teacher':
        raise HTTPException(status_code=400, detail="El usuario especificado no es un docente")
    
    return crud.get_teacher_subjects(db, teacher_id)

@app.post("/teachers/{teacher_id}/subjects", response_model=schemas.TeacherSubjectOut)
def add_subject_to_teacher(
    teacher_id: int,
    subject_data: schemas.TeacherSubjectCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Agregar una materia a un docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden agregar materias")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes agregar materias a tu propio perfil")
    
    # Verificar que la materia existe
    subject = crud.get_subject_by_id(db, subject_data.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    
    # Verificar que no existe ya la relación
    existing_subjects = crud.get_teacher_subjects(db, teacher_id)
    if any(ts.subject_id == subject_data.subject_id for ts in existing_subjects):
        raise HTTPException(status_code=400, detail="Ya tienes esta materia asignada")
    
    teacher_subject = crud.add_subject_to_teacher(db, teacher_id, subject_data.subject_id)
    if not teacher_subject:
        raise HTTPException(status_code=400, detail="Error al agregar la materia")
    
    return teacher_subject

@app.delete("/teachers/{teacher_id}/subjects/{subject_id}")
def remove_subject_from_teacher(
    teacher_id: int,
    subject_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar una materia de un docente"""
    # Verificar que el usuario es un docente y es el mismo que el teacher_id
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Solo los docentes pueden eliminar materias")
    
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Solo puedes eliminar materias de tu propio perfil")
    
    success = crud.remove_subject_from_teacher(db, teacher_id, subject_id)
    if not success:
        raise HTTPException(status_code=404, detail="Materia no encontrada en tu perfil")
    
    return {"message": "Materia eliminada exitosamente"}

@app.get("/subjects/levels")
def get_subject_levels(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obtener lista de niveles disponibles"""
    return crud.get_subject_levels(db)