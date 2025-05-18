from sqladmin import Admin, ModelView
from .database import engine
from .models import (
    User, Professor, Subject, ProfessorSubject,
    Tutorship, Payment, Review, Resource, LiveSession
)

class UserAdmin(ModelView, model=User):
    name = "Usuario"
    name_plural = "Usuarios"
    icon = "fa-solid fa-users"
    category = "Gestión de Usuarios"
    column_list = [User.id, User.name, User.email, User.role]
    column_searchable_list = [User.name, User.email]
    column_sortable_list = [User.id, User.name, User.email, User.role]
    column_details_list = [User.id, User.name, User.email, User.role, "professor_profile", "student_tutorships"]
    can_create = True
    can_edit = True
    can_delete = True

class ProfessorAdmin(ModelView, model=Professor):
    name = "Profesor"
    name_plural = "Profesores"
    icon = "fa-solid fa-chalkboard-teacher"
    category = "Gestión de Usuarios"
    column_list = [Professor.id, Professor.ranking, "user.name", "subjects", "tutorships"]
    column_details_list = [Professor.id, Professor.abstract, Professor.picture, Professor.ranking, "user", "subjects", "tutorships"]

class SubjectAdmin(ModelView, model=Subject):
    name = "Materia"
    name_plural = "Materias"
    icon = "fa-solid fa-book"
    category = "Contenido Educativo"
    column_list = [Subject.id, Subject.name, Subject.level, Subject.description]

class ProfessorSubjectAdmin(ModelView, model=ProfessorSubject):
    name = "Asignación"
    name_plural = "Asignaciones Profesor-Materia"
    icon = "fa-solid fa-user-graduate"
    category = "Contenido Educativo"
    column_list = [ProfessorSubject.id, "professor.user.name", "subject.name"]
    column_details_list = [ProfessorSubject.id, "professor", "subject"]

class TutorshipAdmin(ModelView, model=Tutorship):
    name = "Tutoría"
    name_plural = "Tutorías"
    icon = "fa-solid fa-chalkboard"
    category = "Gestión de Clases"
    column_list = [
        Tutorship.id, "professor.user.name", "student.name", 
        "subject.name", Tutorship.status, Tutorship.start_time, 
        Tutorship.end_time, Tutorship.price_usdt, Tutorship.platform_fee_pct
    ]
    column_details_list = [
        Tutorship.id, "professor", "student", "subject", 
        Tutorship.status, Tutorship.start_time, Tutorship.end_time, 
        Tutorship.price_usdt, Tutorship.platform_fee_pct
    ]

class PaymentAdmin(ModelView, model=Payment):
    name = "Pago"
    name_plural = "Pagos"
    icon = "fa-solid fa-dollar-sign"
    category = "Finanzas"
    column_list = [
        Payment.id, "tutorship.id", Payment.transaction_hash,
        Payment.amount_usdt, Payment.timestamp, Payment.status
    ]

class ReviewAdmin(ModelView, model=Review):
    name = "Reseña"
    name_plural = "Reseñas"
    icon = "fa-solid fa-star"
    category = "Gestión de Clases"
    column_list = [
        Review.id, "student.name", "professor.user.name", 
        "tutorship.id", Review.rating, Review.comment
    ]

class ResourceAdmin(ModelView, model=Resource):
    name = "Recurso"
    name_plural = "Recursos"
    icon = "fa-solid fa-folder"
    category = "Material Didáctico"
    column_list = [
        Resource.id, "tutorship.id", Resource.title,
        Resource.file_url, Resource.uploaded_at
    ]

class LiveSessionAdmin(ModelView, model=LiveSession):
    name = "Sesión en Vivo"
    name_plural = "Sesiones en Vivo"
    icon = "fa-solid fa-video"
    category = "Gestión de Clases"
    column_list = [
        LiveSession.id, "tutorship.id", LiveSession.start_time,
        LiveSession.end_time, LiveSession.session_url, LiveSession.whiteboard_url
    ]

def setup_admin(app):
    admin = Admin(app=app, engine=engine)

    admin.add_view(UserAdmin)
    admin.add_view(ProfessorAdmin)
    admin.add_view(SubjectAdmin)
    admin.add_view(ProfessorSubjectAdmin)
    admin.add_view(TutorshipAdmin)
    admin.add_view(PaymentAdmin)
    admin.add_view(ReviewAdmin)
    admin.add_view(ResourceAdmin)
    admin.add_view(LiveSessionAdmin)

    return admin
