# TaskFlow - fixed project

This version uses MongoDB Atlas as the source of truth for users and tasks.

Authentication uses an HTTP-only JWT cookie. The frontend does not store auth tokens, users, passwords, or tasks in localStorage.

## Setup

1. Keep your existing `backend/.env` file (do not commit or share it), or copy values from your existing project into `backend/.env`.
2. Ensure it contains:

```env
PORT=5000
MONGODB_URI=your-atlas-connection-string
MONGODB_DB=todo_db
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:3000
```

3. Ensure `frontend/.env` contains:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

4. Install dependencies:

```powershell
cd backend
npm install
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

5. Open `http://localhost:3000`.

Registration creates the account in MongoDB and sends the user to Login. Login creates the HTTP-only session cookie and then opens Dashboard.

The dashboard task list, create, complete, update, and delete operations use the MongoDB-backed API.

The redundant `AppRouter.js` was removed. `App.js` is the single routing entry point, and the auth page files were renamed to `LoginPage.js` and `RegisterPage.js` to eliminate the old filename-casing diagnostic.
