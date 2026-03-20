# Admin + Backend Docker Setup (PostgreSQL + Web Admin)

This project now includes:

- **Backend API** (`auth_service`) on `http://localhost:5002`
- **PostgreSQL** (`postgres`) on `localhost:5432`
- **pgAdmin** on `http://localhost:5050`
- **Web Admin dashboard** on `http://localhost:5173`

---

## 1) Configure admin key

Edit `education-backend/.env`:

- `ADMIN_PANEL_KEY=changeme-admin-key`

Use your own strong secret value.

---

## 2) Start all services with Docker

From `education-backend` directory:

1. Build and start:
   - `docker compose up -d --build`
2. Check services:
   - `docker compose ps`

Expected containers:

- `auth_service`
- `education_postgres`
- `education_pgadmin`
- `education_webadmin`

---

## 3) Open web admin

Open: `http://localhost:5173`

On top-right, enter your admin key (`ADMIN_PANEL_KEY`) and click **Connect**.

Tabs available:

- **Courses**: list, edit, delete
- **Mentors**: list, edit, delete
- **Members**: list, edit, delete

---

## 4) Admin API endpoints

All endpoints require header:

- `x-admin-key: <ADMIN_PANEL_KEY>`
Base: `http://localhost:5002/api/admin`
### Courses

- `GET /courses`
- `PUT /courses/:id`
- `DELETE /courses/:id`

### Mentors

- `GET /mentors`
- `PUT /mentors/:id`
- `DELETE /mentors/:id`

### Members

- `GET /members`
- `PUT /members/:id`
- `DELETE /members/:id`

---

## 5) Data model notes

- Mentors are users with roles: `mentor`, `instructor`, or `teacher`.
- Members are users with role: `student`.
- Login activity is tracked in `users.last_login_at` and shown in admin tables.

---

## 6) Stop services

From `education-backend`:

- `docker compose down`

(Use `-v` if you want to remove DB volume too.)
