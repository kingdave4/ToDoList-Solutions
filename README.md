# Migrated Todo Application

This repository contains the migrated frontend (Vue/Vite) and backend (Node/Express) code for a simple Todo application.

## Project Overview

The application allows users to manage a list of tasks (todos). Features include:

- Creating new todos with title, description, and due date.
- Viewing the list of todos.
- Marking todos as complete or incomplete.
- Deleting todos.
- Filtering todos (all, incomplete, completed).
- Sorting todos (by creation date, by due date).

## Authentication

The application now includes user authentication features:

- User registration with username and password.
- User login and session management using JWT (JSON Web Tokens).
- Protected API routes requiring authentication for access (e.g., creating, updating, deleting todos).
- User-specific todo lists, ensuring users only see and manage their own tasks.

The backend uses a simple Express server and stores data in a `todos.json` file. The frontend is built with Vue 3 and Vite.

## How to Run

### Prerequisites

- Node.js and npm (or yarn) installed.

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (defaults to port 3000):
   ```bash
   node server.js
   ```
   The backend API will be running at `http://localhost:3000`.

4. **Environment Variables:**
   Create a `.env` file in the `backend` directory with the following content:
   ```
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=adminpass
   ```
   **Note:** Replace `your_jwt_secret_key_here` with a strong, unique secret for production environments.

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (usually runs on port 5173):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (e.g., `http://localhost:5173`).

## How to Test (Backend)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the tests using Jest:
   ```bash
   npm test
   ```
   This will execute the API endpoint tests located in the `tests` directory.

## Running with Docker

1.  Make sure you have Docker installed and running.
2.  Navigate to the project root directory.
3.  Run the following command to build and start the application:

    ```bash
    docker compose up --build
    ```

4.  The frontend will be accessible at `http://localhost`.

## Running with Kubernetes

1.  Make sure you have Minikube and kubectl installed and running.
2.  Navigate to the project root directory.
3.  Start Minikube:

    ```bash
    minikube start
    ```

4.  Build the Docker images:

    ```bash
    minikube docker-env
    eval $(minikube docker-env)
    docker build -t backend:latest ./backend
    docker build -t frontend:latest ./frontend
    ```

5.  Apply the Kubernetes configurations:

    ```bash
    kubectl apply -f backend-deployment.yaml
    kubectl apply -f backend-service.yaml
    kubectl apply -f frontend-deployment.yaml
    kubectl apply -f frontend-service.yaml
    ```

6.  Get the frontend service URL:

    ```bash
    minikube service frontend-service --url
    ```

7.  Open your browser and navigate to the URL provided by Minikube.
## Design Choices

### Authentication
- **JWT (JSON Web Tokens):** Used for secure authentication and authorization. Tokens are issued upon successful login and must be included in subsequent requests to protected routes.
- **Bcrypt:** Passwords are hashed using bcrypt before being stored, ensuring sensitive user data is protected.
- **Middleware:** Authentication middleware (`backend/middleware/auth.js`) is used to verify JWTs and protect routes.

- **Backend:**
  - **Framework:** Express.js was chosen for its simplicity, flexibility, and wide adoption in the Node.js ecosystem, making it suitable for building RESTful APIs quickly.
  - **Data Persistence:** A simple `todos.json` file is used for storing data. This keeps the setup minimal and avoids the need for a database for this example project. For a production application, a proper database (e.g., PostgreSQL, MongoDB) would be recommended. The `dataService.js` module abstracts the file read/write operations.
  - **Routing:** Express Router is used (`routes/todos.js`, `routes/auth.js`) to organize the API endpoints logically.
- **User Management:**
  - `userService.js`: Handles user-related operations, including creating new users and validating credentials.
  - `auth.js`: Manages JWT token generation and verification.
- **Testing Strategy (Backend):**
  - **Framework:** Jest is used as the test runner, along with `supertest` for making HTTP requests to the API endpoints during testing.
  - **Approach:** Integration tests are written to cover the API endpoints directly. The `dataService` and `userService` modules are mocked using `jest.mock()` to isolate the route handlers from the actual file system during tests, allowing for predictable and controlled test scenarios. Tests cover success cases, error handling (e.g., 404 Not Found, 400 Bad Request, 401 Unauthorized), and edge cases (e.g., missing data, invalid tokens).

## Assumptions

- Node.js and npm are installed on the system running the application.
- The backend server is expected to run on port 3000. If this port is occupied, the frontend might need its `backendUrl` variable updated in `src/App.vue`.
- The `data/todos.json` and `data/users.json` files will be created automatically if they don't exist when the backend first tries to write to them.
- Environment variables (JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD) are expected to be set for the backend.

## Trade-offs (Optional)

- **JSON File Storage:** While simple, using a JSON file for data storage is not suitable for production due to potential race conditions, lack of scalability, and inefficient querying. A database would be a better choice for real-world applications.
- **Basic Error Handling:** Frontend error handling is basic and primarily displays messages to the user. More robust error handling and user feedback mechanisms could be implemented.
- **No Frontend Tests:** Due to time constraints or focus, frontend unit/component tests were not included in this migration scope.
- **Basic Frontend Authentication Flow:** The frontend handles basic login/logout. More advanced features like "remember me," password reset, or account recovery are not implemented.
