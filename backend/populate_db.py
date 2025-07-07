"""
Script para poblar la base de datos con datos de ejemplo
"""
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app import models, crud

def create_sample_subjects():
    """Crear materias de ejemplo"""
    db = next(get_db())
    
    # Verificar si ya existen materias
    existing_subjects = crud.get_subjects(db)
    if existing_subjects:
        print(f"Ya existen {len(existing_subjects)} materias en la base de datos")
        return
    
    sample_subjects = [
        {"name": "Matemática", "description": "Álgebra, geometría, cálculo", "level": "secundaria", "credits": 4, "department": "Ciencias Exactas"},
        {"name": "Física", "description": "Mecánica, termodinámica, óptica", "level": "secundaria", "credits": 4, "department": "Ciencias Exactas"},
        {"name": "Química", "description": "Química general e inorgánica", "level": "secundaria", "credits": 3, "department": "Ciencias Exactas"},
        {"name": "Historia", "description": "Historia universal y nacional", "level": "secundaria", "credits": 3, "department": "Ciencias Sociales"},
        {"name": "Geografía", "description": "Geografía física y humana", "level": "secundaria", "credits": 3, "department": "Ciencias Sociales"},
        {"name": "Literatura", "description": "Literatura clásica y contemporánea", "level": "secundaria", "credits": 3, "department": "Humanidades"},
        {"name": "Inglés", "description": "Idioma inglés básico e intermedio", "level": "secundaria", "credits": 3, "department": "Idiomas"},
        {"name": "Biología", "description": "Biología general y celular", "level": "secundaria", "credits": 4, "department": "Ciencias Naturales"},
        {"name": "Economía", "description": "Microeconomía y macroeconomía", "level": "secundaria", "credits": 3, "department": "Ciencias Sociales"},
        {"name": "Informática", "description": "Programación y ofimática", "level": "secundaria", "credits": 3, "department": "Tecnología"},
        
        # Materias universitarias
        {"name": "Cálculo", "description": "Cálculo diferencial e integral", "level": "terciaria", "credits": 6, "department": "Matemáticas"},
        {"name": "Álgebra Lineal", "description": "Matrices, vectores y espacios vectoriales", "level": "terciaria", "credits": 4, "department": "Matemáticas"},
        {"name": "Estadística", "description": "Estadística descriptiva e inferencial", "level": "terciaria", "credits": 4, "department": "Matemáticas"},
        {"name": "Programación", "description": "Programación en diversos lenguajes", "level": "terciaria", "credits": 6, "department": "Ingeniería"},
        {"name": "Base de Datos", "description": "Diseño y gestión de bases de datos", "level": "terciaria", "credits": 4, "department": "Ingeniería"},
        
        # Materias primarias
        {"name": "Matemática Básica", "description": "Aritmética básica", "level": "primaria", "credits": 3, "department": "Educación Básica"},
        {"name": "Ciencias Naturales", "description": "Introducción a las ciencias", "level": "primaria", "credits": 3, "department": "Educación Básica"},
        {"name": "Lengua", "description": "Comprensión lectora y escritura", "level": "primaria", "credits": 4, "department": "Educación Básica"},
        {"name": "Ciencias Sociales", "description": "Historia y geografía básica", "level": "primaria", "credits": 3, "department": "Educación Básica"},
    ]
    
    created_count = 0
    for subject_data in sample_subjects:
        try:
            created_subject = crud.create_subject(db, subject_data)
            print(f"Creada materia: {created_subject.name} ({created_subject.level})")
            created_count += 1
        except Exception as e:
            print(f"Error creando materia {subject_data['name']}: {e}")
    
    print(f"Se crearon {created_count} materias exitosamente")

if __name__ == "__main__":
    # Crear las tablas si no existen
    models.Base.metadata.create_all(bind=engine)
    
    # Poblar con datos de ejemplo
    create_sample_subjects()
