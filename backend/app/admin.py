from sqladmin import Admin, ModelView
from wtforms.fields import SelectField, DateTimeField
from .database import engine
from .models import (
    User, Professor, Subject, ProfessorSubject,
    Tutorship, Payment, Review, Resource, LiveSession, TeacherMediaFile,
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

    column_list = [Professor.id, Professor.ranking, "user", "subjects"]
    column_details_list = [Professor.id, Professor.abstract, Professor.picture, Professor.ranking, "user", "subjects"]

    form_columns = [Professor.abstract, Professor.picture, Professor.ranking]
    
    # Sobrescribir el método para crear perfiles faltantes automáticamente
    async def list(self, request):
        # Crear perfiles de profesor faltantes antes de mostrar la lista
        from .crud import create_missing_professor_profiles
        from .database import SessionLocal
        
        db = SessionLocal()
        try:
            created_count = create_missing_professor_profiles(db)
            if created_count > 0:
                print(f"Se crearon {created_count} perfiles de profesor faltantes")
        except Exception as e:
            print(f"Error creando perfiles de profesor: {e}")
        finally:
            db.close()
        
        return await super().list(request)

class SubjectAdmin(ModelView, model=Subject):
    name = "Materia"
    name_plural = "Materias"
    icon = "fa-solid fa-book"
    category = "Contenido Educativo"

    column_list = [Subject.id, Subject.name, Subject.level, Subject.credits, Subject.department, Subject.description]
    column_filters = [Subject.level, Subject.department]
    column_searchable_list = [Subject.name, Subject.description, Subject.department]

    form_columns = [Subject.name, Subject.description, Subject.level, Subject.credits, Subject.department]
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

    column_list = [ProfessorSubject.id, "professor", "subject"]
    column_details_list = [ProfessorSubject.id, "professor", "subject"]

    form_columns = [ProfessorSubject.professor, ProfessorSubject.subject]

class TutorshipAdmin(ModelView, model=Tutorship):
    name = "Tutoría"
    name_plural = "Tutorías"
    icon = "fa-solid fa-chalkboard"
    category = "Gestión de Clases"

    column_list = [
        Tutorship.id, "professor", "student", 
        "subject", Tutorship.status, Tutorship.start_time, 
        Tutorship.end_time, Tutorship.price_usdt, Tutorship.platform_fee_pct
    ]
    column_filters = [
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

    async def insert(self, request, obj):
        # Personalizar la inserción si es necesario
        return await super().insert(request, obj)

    async def update(self, request, pk, obj):
        # Personalizar la actualización si es necesario
        return await super().update(request, pk, obj)

class PaymentAdmin(ModelView, model=Payment):
    name = "Pago"
    name_plural = "Pagos"
    icon = "fa-solid fa-dollar-sign"
    category = "Finanzas"
    
    column_list = [
        Payment.id, Payment.tutorship_id, Payment.transaction_hash,
        Payment.amount_usdt, Payment.timestamp, Payment.status
    ]
    column_filters = [Payment.status, Payment.timestamp]

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
        Review.id, Review.student_id, Review.professor_id, 
        Review.tutorship_id, Review.rating, Review.comment
    ]
    column_filters = [Review.rating]

    form_columns = [
        Review.student_id, Review.professor_id, Review.tutorship_id,
        Review.rating, Review.comment
    ]

class TeacherMediaFileAdmin(ModelView, model=TeacherMediaFile):
    name = "Archivo de Medios"
    name_plural = "Archivos de Medios"
    icon = "fa-solid fa-file-upload"
    category = "Material Didáctico"

    column_list = [
        TeacherMediaFile.id, "teacher", TeacherMediaFile.original_filename,
        TeacherMediaFile.file_size, TeacherMediaFile.mime_type, 
        TeacherMediaFile.uploaded_at, TeacherMediaFile.description
    ]
    column_filters = [
        TeacherMediaFile.mime_type, TeacherMediaFile.uploaded_at
    ]
    column_searchable_list = [
        TeacherMediaFile.original_filename, TeacherMediaFile.description
    ]
    column_sortable_list = [
        TeacherMediaFile.id, TeacherMediaFile.original_filename, 
        TeacherMediaFile.file_size, TeacherMediaFile.uploaded_at
    ]
    
    column_details_list = [
        TeacherMediaFile.id, "teacher", TeacherMediaFile.filename, 
        TeacherMediaFile.original_filename, TeacherMediaFile.file_path,
        TeacherMediaFile.file_size, TeacherMediaFile.mime_type,
        TeacherMediaFile.uploaded_at, TeacherMediaFile.description
    ]

    # Formatear el tamaño del archivo de manera legible
    column_formatters = {
        TeacherMediaFile.file_size: lambda m, a: f"{m.file_size / 1024:.1f} KB" if m.file_size else "N/A",
        TeacherMediaFile.uploaded_at: lambda m, a: m.uploaded_at.strftime("%d/%m/%Y %H:%M") if m.uploaded_at else "N/A"
    }

    # Solo permitir editar la descripción
    form_columns = [TeacherMediaFile.description]
    
    form_overrides = {
        TeacherMediaFile.uploaded_at: DateTimeField,
    }

    # Configuración de permisos
    can_create = False  # Los archivos se crean a través de la API
    can_edit = True     # Solo se puede editar la descripción
    can_delete = True   # Los admins pueden eliminar archivos
    can_view_details = True

    # Paginación
    page_size = 50
    page_size_options = [25, 50, 100, 200]

    # Ordenamiento por defecto (más recientes primero)
    column_default_sort = [(TeacherMediaFile.uploaded_at, True)]

class ResourceAdmin(ModelView, model=Resource):
    name = "Recurso"
    name_plural = "Recursos"
    icon = "fa-solid fa-folder"
    category = "Material Didáctico"

    column_list = [
        Resource.id, Resource.tutorship_id, Resource.title, Resource.uploaded_at
    ]
    column_filters = [
        Resource.tutorship_id, Resource.uploaded_at
    ]
    column_searchable_list = [Resource.title]
    column_sortable_list = [Resource.id, Resource.title, Resource.uploaded_at]

    column_details_list = [
        Resource.id, "tutorship", Resource.title, Resource.file_url, 
        Resource.uploaded_at, "media_file"
    ]

    form_columns = [
        Resource.tutorship_id, Resource.title, Resource.file_url, 
        Resource.uploaded_at, Resource.media_file_id
    ]
    form_overrides = {
        Resource.uploaded_at: DateTimeField,
    }

    # Formatear fecha
    column_formatters = {
        Resource.uploaded_at: lambda m, a: m.uploaded_at.strftime("%d/%m/%Y %H:%M") if m.uploaded_at else "N/A"
    }

    # Ordenamiento por defecto (más recientes primero)
    column_default_sort = [(Resource.uploaded_at, True)]

class LiveSessionAdmin(ModelView, model=LiveSession):
    name = "Sesión en Vivo"
    name_plural = "Sesiones en Vivo"
    icon = "fa-solid fa-video"
    category = "Gestión de Clases"
    
    column_list = [
        LiveSession.id, LiveSession.tutorship_id, LiveSession.start_time,
        LiveSession.end_time, LiveSession.session_url, LiveSession.whiteboard_url
    ]
    column_filters = [LiveSession.tutorship_id, LiveSession.start_time]

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
    admin.add_view(TeacherMediaFileAdmin)
    admin.add_view(ResourceAdmin)
    admin.add_view(LiveSessionAdmin)

    return admin

# Función para arreglar perfiles de profesor faltantes al iniciar
def fix_missing_professor_profiles():
    """Crear perfiles de profesor para usuarios teacher que no los tienen"""
    from .database import SessionLocal
    from .crud import create_missing_professor_profiles
    
    db = SessionLocal()
    try:
        created_count = create_missing_professor_profiles(db)
        if created_count > 0:
            print(f"✅ Se crearon {created_count} perfiles de profesor faltantes")
        else:
            print("✅ Todos los profesores ya tienen sus perfiles")
    except Exception as e:
        print(f"❌ Error creando perfiles de profesor: {e}")
    finally:
        db.close()
