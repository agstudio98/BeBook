# Architecture Overview - BeBook

## 1. Technology Stack
BeBook is built using the **MERN Stack**, a popular choice for full-stack JavaScript applications.

- **Frontend:** React with TypeScript, Vite, Tailwind CSS, and Framer Motion for animations.
- **Backend:** Node.js with Express.js framework.
- **Database:** MongoDB for flexible, document-based data storage.
- **Authentication:** JSON Web Tokens (JWT) and Google OAuth 2.0.

## 2. System Architecture
The application follows a classic client-server architecture:

### 2.1 Frontend (Client)
- **Component-Based Architecture:** Built with React functional components and hooks.
- **Context API:** Used for global state management (Authentication and Shopping Cart).
- **Client-Side Routing:** Managed by React Router.
- **API Integration:** Centralized Axios instance for communicating with the backend.

### 2.2 Backend (Server)
The backend follows a layers-based **MVC (Model-View-Controller)** pattern:
- **Models:** Mongoose schemas defining the data structure for MongoDB.
- **Controllers:** Business logic for handling requests and interacting with models.
- **Routes:** API endpoint definitions that map URLs to specific controller functions.
- **Middleware:** Functions for error handling, JWT authentication, and file uploads.

## 3. Communication Pattern
- **RESTful API:** Communication between frontend and backend is done via JSON-based REST endpoints.
- **Stateless Authentication:** The server does not store session state; instead, it validates JWTs sent in the Authorization header.

## 4. Key Security Measures
- **Password Hashing:** Using Bcrypt.js before storing passwords in the database.
- **Protected Routes:** Middleware ensuring only authorized users can access specific endpoints.
- **CORS Configuration:** Restricting API access to trusted origins.
- **Environment Variables:** Protecting sensitive keys (DB URI, JWT Secret, Google Client ID) using `.env` files.
