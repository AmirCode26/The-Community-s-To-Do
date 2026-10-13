# Community Management & Task Structure System (`tc_td`)

A decentralized community structure and task management application built for high performance and modern web standards.

## 🚀 Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Backend Framework:** Node.js / Express with TypeScript
- **Database & ORM:** PostgreSQL & Prisma ORM
- **Frontend Framework:** Vite.js + React (TypeScript)
- **Styling & UI:** Tailwind CSS & shadcn/ui

---

## 🛠️ Prerequisites

Make sure you have the following installed on your system:
- [Bun](https://bun.sh/) (v1.0 or higher)
- [PostgreSQL](https://www.postgresql.org/)

---

## ⚙️ Installation & Setup

### 1. Database Setup
Create a PostgreSQL database (e.g., `tc_td_db`):
```bash
createdb -U postgres tc_td_db
```

### 2. Backend Setup
Navigate to the backend directory, configure your environment, and install dependencies:
```bash
cd backend
bun install
```
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tc_td_db?schema=public"
PORT=4000
```
Run database migrations/sync:
```bash
bunx prisma db push
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
bun install
```

---

## 🏃‍♂️ Running the Project

You can run both the backend and frontend development servers using Bun.

### Run the Backend:
Open a terminal in the `backend` folder and run:
```bash
bun run dev
```

### Run the Frontend:
Open a separate terminal in the `frontend` folder and run:
```bash
bun run dev
```

---

## 📦 Building for Production

To build both parts of the application for production deployment, use the build script in their respective directories:

```bash
# Inside frontend or backend folder
bun run build
```
