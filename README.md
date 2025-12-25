# SkillHive 🚀  
**A Full-Stack Learning Management System (LMS)**

SkillHive is a modern Learning Management System built with **Django REST Framework** for the backend and **React + Vite** for the frontend.  
It supports instructor and student roles, course creation, enrollment, lesson tracking, and is designed with scalability in mind using **PostgreSQL**, **Redis**, and **Docker**.

---

## ✨ Features

### Instructor
- Create and manage courses
- Add modules and lessons
- Upload lesson content (text/video)
- View enrolled students

### Student
- Browse published courses
- Enroll in courses
- Track lesson progress
- Student dashboard with enrolled courses

### ⚙️ Platform
- Role-based authentication (JWT)
- PostgreSQL full-text search for courses
- Redis caching for performance
- Modular backend architecture
- Reusable frontend components
- Automated tests using `pytest`

---

## 🧱 Tech Stack

### Backend
- Python 3.12
- Django
- Django REST Framework
- PostgreSQL
- Redis
- JWT Authentication
- Pytest

### Frontend
- React
- Vite
- Axios
- Context API

### DevOps
- Docker & Docker Compose
- pgAdmin (for database management)
- WSL-friendly development setup

---

## 📁 Project Structure

```text
SkillHive/
├── backend/
│   ├── accounts/
│   ├── courses/
│   ├── skillhive/
│   ├── manage.py
│   ├── requirements.txt
│   └── docker-compose.yaml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
