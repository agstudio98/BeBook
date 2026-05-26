# Development Setup Guide - BeBook

## 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas URI)
- **npm** (for Backend)
- **pnpm** (for Frontend)

## 2. Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in `backend/` and configure:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_id
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 3. Frontend Setup
1.  Navigate to the `frontend/BeBook` directory:
    ```bash
    cd frontend/BeBook
    ```
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```
3.  Create a `.env` file in `frontend/BeBook/` and configure:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_GOOGLE_CLIENT_ID=your_google_id
    ```
4.  Start the Vite development server:
    ```bash
    pnpm dev
    ```

## 4. Running Tests
To run the backend test suite:
```bash
cd backend
npm test
```

## 5. Directory Structure
- `/backend`: Express API, Mongoose models, and controllers.
- `/frontend/BeBook`: React application with TypeScript and Tailwind CSS.
- `/docs`: Project documentation.
