# TaskFlow setup

## Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your MongoDB Atlas connection string in `MONGODB_URI`.
3. Set a strong `JWT_SECRET`.
4. Run:

   npm install
   npm run dev

The API runs on `http://localhost:5000`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env` when the API is not on the default port.
2. Run:

   npm install
   npm start

The web app runs on `http://localhost:3000`.

## Authentication model

Authentication uses the backend httpOnly `token` cookie. The frontend does not store authentication tokens in localStorage.

Registration creates the MongoDB user but does not authenticate the browser. The user is sent to `/login` and must explicitly sign in.

## Routing

The application intentionally keeps a dedicated `AppRouter` with separate public and protected routes:

- `/login`
- `/register`
- `/dashboard`
- `/calendar`
- `/activity`
- `/profile`
