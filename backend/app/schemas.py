# SCHEMAS.PY COMPLETO
from pydantic import BaseModel, EmailStr, Field, constr
from typing import Optional, List
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    mod = "mod"

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: UserRole
    class Config:
        from_attributes = True

class ProfessorBase(BaseModel):
    abstract: Optional[str]
    picture: Optional[str]

class ProfessorOut(ProfessorBase):
    id: int
    ranking: float
    user: UserOut
    class Config:
        from_attributes = True

class SubjectLevel(str, enum.Enum):
    primaria = "primaria"
    secundaria = "secundaria"
    terciaria = "terciaria"

class SubjectBase(BaseModel):
    name: str
    description: Optional[str]
    level: SubjectLevel  # ← NUEVO
    credits: Optional[int] = 3
    department: Optional[str] = "Sin asignar"

class SubjectOut(SubjectBase):
    id: int
    class Config:
        from_attributes = True

class TutorshipBase(BaseModel):
    professor_id: int
    student_id: int
    subject_id: int
    status: Optional[str] = "pending"
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    price_usdt: float
    platform_fee_pct: Optional[float] = 5.0

class TutorshipCreate(TutorshipBase):
    pass

class TutorshipOut(TutorshipBase):
    id: int
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    tutorship_id: int
    transaction_hash: str
    amount_usdt: float
    timestamp: datetime
    status: str

class ReviewBase(BaseModel):
    student_id: int
    professor_id: int
    tutorship_id: int
    rating: int
    comment: Optional[str]

class TeacherMediaFileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    description: Optional[str] = None

class TeacherMediaFileCreate(TeacherMediaFileBase):
    teacher_id: int
    file_path: str

class TeacherMediaFileOut(TeacherMediaFileBase):
    id: int
    teacher_id: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    tutorship_id: int
    media_file_id: Optional[int] = None
    title: str
    file_url: Optional[str] = None
    uploaded_at: datetime

class LiveSessionBase(BaseModel):
    tutorship_id: int
    start_time: datetime
    end_time: datetime
    session_url: str
    whiteboard_url: str

class TutorshipDetailOut(BaseModel):
    id: int
    professor_id: int
    student_id: int
    subject_id: int
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    price_usdt: float
    platform_fee_pct: float
    
    # Información relacionada
    student: Optional[UserOut] = None
    subject: Optional[SubjectOut] = None
    
    class Config:
        from_attributes = True

class TutorshipStatusUpdate(BaseModel):
    status: str
    
    class Config:
        from_attributes = True

# Schemas para disponibilidad de profesores
class TeacherAvailabilityBase(BaseModel):
    day_of_week: int  # 0 = Lunes, 6 = Domingo
    start_time: str   # "HH:MM"
    end_time: str     # "HH:MM"
    is_available: bool = True

class TeacherAvailabilityCreate(TeacherAvailabilityBase):
    teacher_id: int

class TeacherAvailabilityOut(TeacherAvailabilityBase):
    id: int
    teacher_id: int
    class Config:
        from_attributes = True

# Schemas para agenda de profesores
class TeacherScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_datetime: datetime
    end_datetime: datetime
    is_blocked: bool = False

class TeacherScheduleCreate(TeacherScheduleBase):
    teacher_id: int

class TeacherScheduleOut(TeacherScheduleBase):
    id: int
    teacher_id: int
    class Config:
        from_attributes = True

# Schemas para slots disponibles
class AvailableSlot(BaseModel):
    start_datetime: datetime
    end_datetime: datetime
    duration_minutes: int

class TeacherAvailabilityResponse(BaseModel):
    teacher_id: int
    teacher_name: str
    available_slots: list[AvailableSlot]

# Schemas para materias del docente
class TeacherSubjectOut(BaseModel):
    id: int
    professor_id: int
    subject_id: int
    subject: SubjectOut
    
    class Config:
        from_attributes = True

class TeacherSubjectCreate(BaseModel):
    subject_id: int