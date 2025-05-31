# MODELS.PY COMPLETO
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Enum, DateTime, Text
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

class Professor(Base):
    __tablename__ = "professors"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    abstract = Column(Text)
    picture = Column(String)
    ranking = Column(Float, default=0.0)

    user = relationship("User", back_populates="professor_profile")
    subjects = relationship("ProfessorSubject", back_populates="professor")
    tutorships = relationship("Tutorship", back_populates="professor")

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

class ProfessorSubject(Base):
    __tablename__ = "professor_subjects"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("professors.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    professor = relationship("Professor", back_populates="subjects")
    subject = relationship("Subject")

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

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    transaction_hash = Column(String)
    amount_usdt = Column(Float)
    timestamp = Column(DateTime)
    status = Column(String)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    professor_id = Column(Integer, ForeignKey("professors.id"))
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    rating = Column(Integer)
    comment = Column(Text)

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

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    media_file_id = Column(Integer, ForeignKey("teacher_media_files.id"), nullable=True)
    title = Column(String)
    file_url = Column(String)
    uploaded_at = Column(DateTime)

    media_file = relationship("TeacherMediaFile")

class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(Integer, primary_key=True)
    tutorship_id = Column(Integer, ForeignKey("tutorships.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    session_url = Column(String)
    whiteboard_url = Column(String)