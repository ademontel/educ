from sqladmin import Admin, ModelView
from wtforms.fields import SelectField, DateTimeField
from .database import engine
from .models import (
    User, Professor, Subject, ProfessorSubject,
    Tutorship, Payment, Review, Resource, LiveSession,
    UserRole, SubjectLevel, TutorshipStatus
)

class UserAdmin(ModelView, model=User):
    name = "Usuario"
    name_plural = "Usuarios"
    icon = "fa-solid fa-users"
    category = "Gestión de Usuarios"

    column_list = [User.id, User.name, User.email, User.role]
    column_searchable_list = [User.name, User.email]
    column_sortable_list = [User.id, User.name, User.email, User.role]
    column_filters = [User.role]
    column_details_list = [User.id, User.name, User.email, User.role, "professor_profile", "student_tutorships"]

    form_columns = [User.name, User.email, User.password, User.role]

    form_overrides = {
        User.role: SelectField,
    }
    form_args = {
        "role": {
            "choices": [(r.value, r.value.capitalize()) for r in UserRole]
        }
    }

    can_create = True
    can_edit = True
    can_delete = True

class ProfessorAdmin(ModelView, model=Professor):
    name = "Profesor"
    name_plural = "Profesores"
    icon = "fa-solid fa-chalkboard-teacher"
    category = "Gestión de Usuarios"

    column_list = [Professor.id, Professor.ranking, "user.name", "subjects", "tutorships"]
    column_filters = ["user.name"]
    column_details_list = [Professor.id, Professor.abstract, Professor.picture, Professor.ranking, "user", "subjects", "tutorships"]

    form_columns = [Professor.user, Professor.abstract, Professor.picture, Professor.ranking]

class SubjectAdmin(ModelView, model=Subject):
    name = "Materia"
    name_plural = "Materias"
    icon = "fa-solid fa-book"
    category = "Contenido Educativo"

    column_list = [Subject.id, Subject.name, Subject.level, Subject.description]
    column_filters = [Subject.level]

    form_columns = [Subject.name, Subject.description, Subject.level]
    form_overrides = {
        Subject.level: SelectField,
    }
    form_args = {
        "level": {
            "choices": [(l.value, l.value.capitalize()) for l in SubjectLevel]
        }
    }

class ProfessorSubjectAdmin(ModelView, model=ProfessorSubject):
    name = "Asignación"
    name_plural = "Asignaciones Profesor-Materia"
    icon = "fa-solid fa-user-graduate"
    category = "Contenido Educativo"

    column_list = [ProfessorSubject.id, "professor.user.name", "subject.name"]
    column_filters = ["professor.user.name", "subject.name"]
    column_details_list = [ProfessorSubject.id, "professor", "subject"]

    form_columns = [ProfessorSubject.professor, ProfessorSubject.subject]

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
    column_filters = [
        "professor.user.name", "student.name", "subject.name",
        Tutorship.status, Tutorship.start_time, Tutorship.end_time
    ]
    column_details_list = [
        Tutorship.id, "professor", "student", "subject", 
        Tutorship.status, Tutorship.start_time, Tutorship.end_time, 
        Tutorship.price_usdt, Tutorship.platform_fee_pct
    ]

    form_columns = [
        Tutorship.professor, Tutorship.student, Tutorship.subject,
        Tutorship.status, Tutorship.start_time, Tutorship.end_time,
        Tutorship.price_usdt, Tutorship.platform_fee_pct
    ]
    form_overrides = {
        Tutorship.status: SelectField,
        Tutorship.start_time: DateTimeField,
        Tutorship.end_time: DateTimeField,
    }
    form_args = {
        "status": {
            "choices": [(s.value, s.value.capitalize()) for s in TutorshipStatus]
        }
    }

class PaymentAdmin(ModelView, model=Payment):
    name = "Pago"
    name_plural = "Pagos"
    icon = "fa-solid fa-dollar-sign"
    category = "Finanzas"

    column_list = [
        Payment.id, "tutorship.id", Payment.transaction_hash,
        Payment.amount_usdt, Payment.timestamp, Payment.status
    ]
    column_filters = ["status", Payment.timestamp]

    form_columns = [
        Payment.tutorship_id, Payment.transaction_hash,
        Payment.amount_usdt, Payment.timestamp, Payment.status
    ]
    form_overrides = {
        Payment.timestamp: DateTimeField,
    }

class ReviewAdmin(ModelView, model=Review):
    name = "Reseña"
    name_plural = "Reseñas"
    icon = "fa-solid fa-star"
    category = "Gestión de Clases"

    column_list = [
        Review.id, "student.name", "professor.user.name", 
        "tutorship.id", Review.rating, Review.comment
    ]
    column_filters = ["student.name", "professor.user.name", Review.rating]

    form_columns = [
        Review.student_id, Review.professor_id, Review.tutorship_id,
        Review.rating, Review.comment
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
    column_filters = ["tutorship.id", Resource.uploaded_at]

    form_columns = [
        Resource.tutorship_id, Resource.title, Resource.file_url, Resource.uploaded_at
    ]
    form_overrides = {
        Resource.uploaded_at: DateTimeField,
    }

class LiveSessionAdmin(ModelView, model=LiveSession):
    name = "Sesión en Vivo"
    name_plural = "Sesiones en Vivo"
    icon = "fa-solid fa-video"
    category = "Gestión de Clases"

    column_list = [
        LiveSession.id, "tutorship.id", LiveSession.start_time,
        LiveSession.end_time, LiveSession.session_url, LiveSession.whiteboard_url
    ]
    column_filters = ["tutorship.id", LiveSession.start_time]

    form_columns = [
        LiveSession.tutorship_id, LiveSession.start_time, LiveSession.end_time,
        LiveSession.session_url, LiveSession.whiteboard_url
    ]
    form_overrides = {
        LiveSession.start_time: DateTimeField,
        LiveSession.end_time: DateTimeField,
    }

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
