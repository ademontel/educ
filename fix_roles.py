#!/usr/bin/env python3

import re

# Leer el archivo
with open('/workspace/backend/app/main.py', 'r') as f:
    content = f.read()

# Hacer los reemplazos necesarios
replacements = [
    (r"current_user\.role not in \['teacher', 'docente'\]", "current_user.role != 'teacher'"),
    (r"current_user\.role in \['teacher', 'docente'\]", "current_user.role == 'teacher'"),
    (r"professor\.role not in \['teacher', 'docente'\]", "professor.role != 'teacher'"),
    (r"['teacher', 'docente', 'student', 'alumno']", "['teacher', 'student', 'alumno']"),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Escribir el archivo corregido
with open('/workspace/backend/app/main.py', 'w') as f:
    f.write(content)

print("Archivo corregido exitosamente")
