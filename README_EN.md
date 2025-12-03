# Prima Backend

> 🌐 [Baca dalam Bahasa Indonesia](README.md)

Backend API for Prima application, built using [Hono](https://hono.dev/) framework with Node.js and PostgreSQL.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
  - [Using Docker (Recommended)](#using-docker-recommended)
  - [Manual Installation](#manual-installation)
- [Usage Guide](#usage-guide)
  - [Running the Application](#running-the-application)
  - [Available Scripts](#available-scripts)
  - [API Endpoints](#api-endpoints)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [CI/CD](#cicd)
- [License](#license)

## About the Project

Prima Backend is a RESTful API that provides services for managing:
- **Authentication** - Login and user session management
- **Users** - User data management
- **Teams** - Team management
- **Customers** - Customer data management
- **Interactions** - Recording customer interactions
- **Products** - Product catalog management
- **Conversions** - Sales conversion tracking

## Technologies Used

| Technology | Description |
|------------|-------------|
| [Hono](https://hono.dev/) | Lightweight and fast web framework |
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Drizzle ORM](https://orm.drizzle.team/) | TypeScript/JavaScript ORM |
| [Docker](https://www.docker.com/) | Application containerization |
| [Zod](https://zod.dev/) | Schema validation |
| [JWT](https://jwt.io/) | Token authentication |
| [Pino](https://getpino.io/) | High-performance logger |

## Prerequisites

Before getting started, make sure you have installed:

- **Docker & Docker Compose** (for Docker installation)
- **Node.js 18+** (for manual installation)
- **PostgreSQL 16+** (for manual installation)
- **npm** or **yarn**

## Installation and Setup

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create environment file**
   
   Create a `.env` file in the project root folder:
   ```env
   DATABASE_URL="postgresql://honouser:honopass@db:5432/honoapp"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

3. **Build and run containers**
   ```bash
   docker-compose up -d --build
   ```
   This command will start:
   - Application server (`app`) on port 3000
   - PostgreSQL database (`db`) on port 5432

4. **Apply database schema**
   ```bash
   docker-compose exec app npm run db:push
   ```

5. **Verify installation**
   
   Open your browser and access `http://localhost:3000`. You should see the message:
   ```
   Hello! Server Hono ini sedang berjalan.
   ```

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   Create a new database in PostgreSQL:
   ```sql
   CREATE DATABASE honoapp;
   CREATE USER honouser WITH PASSWORD 'honopass';
   GRANT ALL PRIVILEGES ON DATABASE honoapp TO honouser;
   ```

4. **Configure environment**
   
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://honouser:honopass@localhost:5432/honoapp"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

5. **Apply database schema**
   ```bash
   npm run db:push
   ```

6. **Run the application**
   ```bash
   npm run start
   ```

## Usage Guide

### Running the Application

| Command | Description |
|---------|-------------|
| `npm run start` | Run server in production mode |
| `npm run dev` | Run server in development mode with auto-reload |

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Run the application |
| `npm run dev` | Development mode with watch |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio for database management |
| `npm run lint` | Run ESLint for code checking |

### API Endpoints

All API endpoints use the `/v1` prefix. Endpoints requiring authentication are marked with 🔒.

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /v1/auth/login` | User login |
| `POST /v1/auth/register` | User registration |
| 🔒 `/v1/users/*` | User management |
| 🔒 `/v1/teams/*` | Team management |
| 🔒 `/v1/customers/*` | Customer management |
| 🔒 `/v1/interactions/*` | Interaction management |
| 🔒 `/v1/products/*` | Product management |
| 🔒 `/v1/conversions/*` | Conversion management |

**Authentication:**

To access protected endpoints, include the JWT token in the header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT | `your-secret-key` |
| `PORT` | Server port (optional, default: 3000) | `3000` |
| `NODE_ENV` | Application environment | `development` / `production` |

## Project Structure

```
backend/
├── .github/
│   └── workflows/
│       └── docker-build.yml  # GitHub Actions workflow
├── src/
│   ├── controllers/          # Request handlers
│   ├── db/                   # Database configuration and schema
│   ├── errors/               # Custom error classes
│   ├── middleware/           # Middleware (auth, error handler)
│   ├── routes/               # Route definitions
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions (logger, etc)
│   └── index.js              # Application entry point
├── .env                      # Environment variables (not committed)
├── .gitignore
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker image configuration
├── drizzle.config.js         # Drizzle ORM configuration
├── eslint.config.js          # ESLint configuration
├── package.json
└── README.md
```

## CI/CD

This project uses GitHub Actions for CI/CD. The workflow will automatically:

1. **Build** Docker image when there's a push to `main` branch
2. **Push** image to GitHub Container Registry (GHCR)

**Image available at:**
```
ghcr.io/<owner>/prima-be:latest
```

**Generated tags:**
- `latest` - Latest build from default branch
- `main` - Branch name
- `<sha>` - Git commit SHA

**How to pull image:**
```bash
docker pull ghcr.io/<owner>/prima-be:latest
```

## Troubleshooting

### Database cannot connect

1. Make sure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. For Docker, ensure the `db` container is healthy:
   ```bash
   docker-compose ps
   ```

### Port already in use

Change the port in `.env` file or `docker-compose.yml`:
```env
PORT=3001
```

### Container won't start

View logs for debugging:
```bash
docker-compose logs -f app
```
