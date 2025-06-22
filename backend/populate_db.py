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
        {"name": "Matemática", "description": "Álgebra, geometría, cálculo", "level": "secundaria"},
        {"name": "Física", "description": "Mecánica, termodinámica, óptica", "level": "secundaria"},
        {"name": "Química", "description": "Química general e inorgánica", "level": "secundaria"},
        {"name": "Historia", "description": "Historia universal y nacional", "level": "secundaria"},
        {"name": "Geografía", "description": "Geografía física y humana", "level": "secundaria"},
        {"name": "Literatura", "description": "Literatura clásica y contemporánea", "level": "secundaria"},
        {"name": "Inglés", "description": "Idioma inglés básico e intermedio", "level": "secundaria"},
        {"name": "Biología", "description": "Biología general y celular", "level": "secundaria"},
        {"name": "Economía", "description": "Microeconomía y macroeconomía", "level": "secundaria"},
        {"name": "Informática", "description": "Programación y ofimática", "level": "secundaria"},
        
        # Materias universitarias
        {"name": "Cálculo", "description": "Cálculo diferencial e integral", "level": "terciaria"},
        {"name": "Álgebra Lineal", "description": "Matrices, vectores y espacios vectoriales", "level": "terciaria"},
        {"name": "Estadística", "description": "Estadística descriptiva e inferencial", "level": "terciaria"},
        {"name": "Programación", "description": "Programación en diversos lenguajes", "level": "terciaria"},
        {"name": "Base de Datos", "description": "Diseño y gestión de bases de datos", "level": "terciaria"},
        
        # Materias primarias
        {"name": "Matemática Básica", "description": "Aritmética básica", "level": "primaria"},
        {"name": "Ciencias Naturales", "description": "Introducción a las ciencias", "level": "primaria"},
        {"name": "Lengua", "description": "Comprensión lectora y escritura", "level": "primaria"},
        {"name": "Ciencias Sociales", "description": "Historia y geografía básica", "level": "primaria"},
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
