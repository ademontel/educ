# MODELS.PY COMPLETO
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Enum, DateTime, Text, Boolean, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    mod = "mod"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(Enum(UserRole), nullable=False)

    professor_profile = relationship("Professor", uselist=False, back_populates="user")
    student_tutorships = relationship("Tutorship", back_populates="student", foreign_keys='Tutorship.student_id')
    
    def __str__(self):
        return f"{self.name} ({self.email})"

class Professor(Base):
    __tablename__ = "professors"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    abstract = Column(Text)
    picture = Column(String)
    ranking = Column(Float, default=0.0)

    user = relationship("User", back_populates="professor_profile")
    subjects = relationship("ProfessorSubject", back_populates="professor")
    tutorships = relationship("Tutorship", back_populates="professor")
    
    def __str__(self):
        try:
            return f"Prof. {self.user.name}" if self.user else f"Professor #{self.id}"
        except:
            return f"Professor #{self.id}"

class SubjectLevel(str, enum.Enum):
    primaria = "primaria"
    secundaria = "secundaria"
    terciaria = "terciaria"

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(Text)
    level = Column(Enum(SubjectLevel), nullable=False)
    credits = Column(Integer, default=3)
    department = Column(String, default="Sin asignar")
    
    def __str__(self):
        return f"{self.name} ({self.level})"

class ProfessorSubject(Base):
    __tablename__ = "professor_subjects"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("professors.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    professor = relationship("Professor", back_populates="subjects")
    subject = relationship("Subject")
    
    def __str__(self):
        try:
            professor_name = self.professor.user.name if self.professor and self.professor.user else f"Professor #{self.professor_id}"
        except:
            professor_name = f"Professor #{self.professor_id}"
        
        try:
            subject_name = self.subject.name if self.subject else f"Subject #{self.subject_id}"
        except:
            subject_name = f"Subject #{self.subject_id}"
            
        return f"{professor_name} - {subject_name}"

class TutorshipStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    finished = "finished"
    canceled = "canceled"

class Tutorship(Base):
    __tablename__ = "tutorships"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("professors.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    status = Column(Enum(TutorshipStatus), default=TutorshipStatus.pending)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    price_usdt = Column(Float)
    platform_fee_pct = Column(Float, default=5.0)

    professor = relationship("Professor", back_populates="tutorships")
    student = relationship("User", back_populates="student_tutorships", foreign_keys=[student_id])
    subject = relationship("Subject")
    
    def __str__(self):
        try:
            student_name = self.student.name if self.student else f"Student #{self.student_id}"
        except:
            student_name = f"Student #{self.student_id}"
        
        try:
            professor_name = self.professor.user.name if self.professor and self.professor.user else f"Professor #{self.professor_id}"
        except:
            professor_name = f"Professor #{self.professor_id}"
        
        try:
            subject_name = self.subject.name if self.subject else f"Subject #{self.subject_id}"
        except:
            subject_name = f"Subject #{self.subject_id}"
            
        return f"Tutoría #{self.id}: {student_name} - {professor_name} ({subject_name})"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    transaction_hash = Column(String)
    amount_usdt = Column(Float)
    timestamp = Column(DateTime)
    status = Column(String)
    
    def __str__(self):
        return f"Payment #{self.id} - ${self.amount_usdt} USDT ({self.status})"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    professor_id = Column(Integer, ForeignKey("professors.id"))
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    rating = Column(Integer)
    comment = Column(Text)
    
    def __str__(self):
        student_name = f"Student #{self.student_id}"
        professor_name = f"Professor #{self.professor_id}"
        return f"Review #{self.id}: {student_name} → {professor_name} ({self.rating}★)"

class TeacherMediaFile(Base):
    __tablename__ = "teacher_media_files"

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String)
    uploaded_at = Column(DateTime)
    description = Column(Text)

    teacher = relationship("User")
    
    def __str__(self):
        return f"Media: {self.original_filename}"

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    media_file_id = Column(Integer, ForeignKey("teacher_media_files.id"), nullable=True)
    title = Column(String)
    file_url = Column(String)
    uploaded_at = Column(DateTime)

    media_file = relationship("TeacherMediaFile")
    
    def __str__(self):
        return f"Resource: {self.title}"

class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    session_url = Column(String)
    whiteboard_url = Column(String)
    
    def __str__(self):
        return f"Live Session #{self.id} (Tutorship #{self.tutorship_id})"

class TeacherAvailability(Base):
    __tablename__ = "teacher_availability"

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer)  # 0 = Lunes, 6 = Domingo
    start_time = Column(String)  # "HH:MM"
    end_time = Column(String)    # "HH:MM"
    is_available = Column(Boolean, default=True)

    teacher = relationship("User")

class TeacherSchedule(Base):
    __tablename__ = "teacher_schedule"

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    start_datetime = Column(DateTime)
    end_datetime = Column(DateTime)
    is_blocked = Column(Boolean, default=False)  # True para eventos que bloquean tiempo

    teacher = relationship("User")