# The Community's To-Do (TcTd)

A web platform that helps neighbors organize their housing complex: news, problems, and decisions in one place instead of scattered WhatsApp groups. Communities are organized in levels (sectors, towers, and apartments), and each level has its own leaders, boards, and rules.

Built by Austin Valdez for WarriorHacks 2.0.

## Features

- **Hierarchical structure:** sectors contain towers, towers contain apartments, and every resident belongs to an apartment.
- **Role-based permissions:** `L_NIG` (global admin), `L_SNIG` (sector leader), `L_T` (tower leader), and `I_T` (neighbor). Permissions are enforced in the database layer, not only in the API.
- **Resident verification:** new accounts start as `PENDING` until a sector leader verifies their apartment.
- **Boards and posts:** announcement and discussion boards with per-role read and write rules, and a configurable posting cooldown to prevent spam.
- **Reports with automatic sanctions:** a user can report the same person only once every 5 days, and when 3 different users report the same person, the account is automatically put in `TEMPORARY_BAN`.
- **Zones of Action and tasks:** community tasks that neighbors can vote on.

## Tech Stack

- **Runtime & package manager:** [Bun](https://bun.sh/)
- **Backend:** Node.js / Express with TypeScript
- **Database & ORM:** PostgreSQL and Prisma ORM 8
- **Frontend:** Vite + React (TypeScript)
- **Styling & UI:** Tailwind CSS and shadcn/ui

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or higher)
- [PostgreSQL](https://www.postgresql.org/)

## Installation & Setup

### 1. Database

Create an empty PostgreSQL database (for example `tc_td_db`):

```bash
createdb -U postgres tc_td_db
```

### 2. Backend

```bash
cd backend
bun install
```

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tc_td_db"
PORT=4000
```

Generate the contract and create the tables:

```bash
bunx prisma contract emit
bunx prisma db init
```

> **Note:** this project uses Prisma ORM 8, which replaces `schema.prisma` with a *contract* (`contract.prisma`). `contract emit` generates `contract.json` and `contract.d.ts`, and `db init` creates the tables in an **empty** database. Prisma 8 has no `db push` or `migrate dev` commands. If the database already has tables, use `bunx prisma db update` instead of `db init`.

### 3. Frontend

```bash
cd frontend
bun install
```

## Running the Project

Run the backend (in the `backend` folder):

```bash
bun run dev
```

Run the frontend (in the `frontend` folder, in a separate terminal):

```bash
bun run dev
```

Vite prints the local URL of the frontend (usually `http://localhost:5173`).

## First Use

**The first account you register becomes the global admin (`L_NIG`)** and is activated automatically. Every account registered after that starts as a neighbor (`I_T`) with `PENDING` status until a sector leader verifies it.

## Troubleshooting

- **`DRIVER.CONNECTION_FAILED` with `no pg_hba.conf entry ... no encryption`:** your database requires SSL. Add `?sslmode=require` to the end of `DATABASE_URL`.
- **The database connection fails right away:** check that `.env` exists in the `backend` folder and that `DATABASE_URL` is set. An already exported `DATABASE_URL` in your terminal takes priority over the `.env` file.

## Building for Production

Run the build script inside the `frontend` and `backend` folders:

```bash
bun run build
```
