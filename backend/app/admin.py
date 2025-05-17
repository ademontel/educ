from sqladmin import Admin, ModelView
from .database import engine
from .models import User

class UserAdmin(ModelView, model=User):
    name = "Usuario"
    name_plural = "Usuarios"
    icon = "fa-solid fa-users"
    category = "Gestión de Usuarios"
    column_list = [User.id, User.name, User.email]
    column_searchable_list = [User.name, User.email]
    column_sortable_list = [User.id, User.name, User.email]
    can_create = True
    can_edit = True
    can_delete = True

def setup_admin(app):
    admin = Admin(app=app, engine=engine)
    admin.add_view(UserAdmin)
    return admin