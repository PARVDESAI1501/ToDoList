# TaskFlow — Full-Stack Task Management Application

TaskFlow is a modern full-stack task management web application designed to help users organize tasks, manage deadlines, track activity, and visualize their schedule through a clean and responsive interface.

The application features secure authentication, persistent task storage, calendar-based planning, activity tracking, and protected user routes.

---

## Features

### Authentication

- User registration
- User login and logout
- JWT-based authentication
- Password hashing using bcrypt
- HTTP-only cookie authentication
- Protected application routes
- Persistent user sessions

### Task Management

- Create tasks
- View tasks
- Update existing tasks
- Delete tasks
- Mark tasks as completed
- Store tasks persistently in MongoDB
- User-specific task management

### Dashboard

- Overview of tasks
- Task status tracking
- Quick access to task management
- Clean and responsive interface

### Calendar

- Calendar-based task visualization
- View scheduled tasks and deadlines
- Easier planning and organization

### Activity

- Track task-related activity
- View recent actions and updates

### User Profile

- View authenticated user information
- Dedicated profile page
- Secure access through protected routes

---

## Tech Stack

### Frontend

- React.js
- React Router
- JavaScript
- HTML5
- CSS3
- Fetch API / REST API integration

### Backend

- Node.js
- Express.js
- ES Modules
- REST API
- JSON Web Tokens (JWT)
- bcryptjs
- cookie-parser
- CORS
- dotenv

### Database

- MongoDB Atlas
- MongoDB Node.js Driver

---

## Project Structure

```text
ToDoList/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
├── .gitignore
├── package.json
├── SETUP.md
└── README.md
```

---

## Application Routes

| Route | Description |
|---|---|
| `/login` | User login |
| `/register` | Create a new account |
| `/dashboard` | Main task dashboard |
| `/calendar` | Calendar and task planning |
| `/activity` | User activity |
| `/profile` | User profile |

Protected routes require authentication.

---

## API Endpoints

### Authentication

```text
/api/auth
```

The authentication API supports:

- Register
- Login
- Logout
- Get authenticated user

### Tasks

```text
/api/todos
```

The task API supports:

- Get tasks
- Create task
- Update task
- Delete task

---

## Authentication Flow

TaskFlow uses JWT-based authentication.

```text
User Login
    ↓
Credentials sent to Express API
    ↓
Server validates user
    ↓
Password verified using bcrypt
    ↓
JWT generated
    ↓
JWT stored in HTTP-only cookie
    ↓
Authenticated requests
    ↓
Protected API / Routes
```

Using an HTTP-only cookie prevents frontend JavaScript from directly accessing the authentication cookie.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account

---

## Clone the Repository

```bash
git clone https://github.com/PARVDESAI1501/ToDoList.git
```

Move into the project:

```bash
cd ToDoList
```

---

## Install Dependencies

Install the root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

---

## Environment Variables

Create the following file:

```text
backend/.env
```

Add:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000

MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=todo_db

JWT_SECRET=your_secure_jwt_secret
```

> Never commit the `.env` file to GitHub. It contains sensitive credentials.

An `.env.example` file can be used to document the required environment variables without exposing credentials.

---

## Run the Application

### Start the Backend

From the `backend` directory:

```bash
npm start
```

The API will run on:

```text
http://localhost:5000
```

You can verify the backend using:

```text
GET /api/health
```

---

### Start the Frontend

Open another terminal and navigate to:

```bash
cd frontend
npm start
```

The React application will run on:

```text
http://localhost:3000
```

---

## MongoDB Atlas

TaskFlow uses MongoDB Atlas as its cloud database.

The backend establishes the MongoDB connection using the connection string stored in:

```text
MONGODB_URI
```

Database credentials are stored only in the local `.env` file and are excluded from Git through `.gitignore`.

---

## Security

TaskFlow implements several authentication and security practices:

- Passwords are hashed before database storage
- JWT-based authentication
- HTTP-only authentication cookies
- Protected backend routes
- Environment-based secrets
- MongoDB credentials excluded from Git
- CORS configuration
- User-specific application data

---

## Development Architecture

```text
┌──────────────────────┐
│      React Client    │
│    localhost:3000    │
└──────────┬───────────┘
           │
           │ HTTP / REST API
           │ credentials included
           ▼
┌──────────────────────┐
│   Express.js Server  │
│    localhost:5000    │
├──────────────────────┤
│ Authentication       │
│ JWT                  │
│ Cookie Handling      │
│ Task Controllers     │
│ Protected Routes     │
└──────────┬───────────┘
           │
           │ MongoDB Driver
           ▼
┌──────────────────────┐
│    MongoDB Atlas     │
│                      │
│ Users Collection     │
│ Tasks Collection     │
└──────────────────────┘
```

---

## Future Improvements

Possible future improvements include:

- Task priorities
- Categories and tags
- Advanced task filtering
- Search functionality
- Recurring tasks
- Email reminders
- Push notifications
- Drag-and-drop task organization
- Dark/light theme support
- Team collaboration
- Shared task lists
- Analytics dashboard
- Cloud deployment

---

## Git Workflow

For future updates:

```bash
git add .
git commit -m "Describe your changes"
git push
```

The local `main` branch tracks the GitHub `main` branch.

---

## Author

**Parv Desai**

GitHub: `PARVDESAI1501`

---

## Repository

**ToDoList / TaskFlow**

Full-stack task management application built with React, Node.js, Express, and MongoDB Atlas.

---

## License

This project is intended for educational and portfolio purposes.
