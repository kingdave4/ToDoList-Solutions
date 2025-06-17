# Todo Application

This is a simple Todo application with a frontend built using Vue 3 and Vite, and a backend built using Node.js and Express.

## Project Overview

The application allows users to manage a list of tasks (todos). Key features include:

- Creating, viewing, marking as complete, and deleting todos.
- User authentication (registration and login).

## How to Run Locally

To run this project on your local machine, follow these steps:

### Prerequisites

- Node.js and npm (or yarn) installed.

### 1. Clone the Repository

If you haven't already, clone the repository from GitHub:

```bash
git clone <repository_url>
```

Replace `<repository_url>` with the actual URL of the GitHub repository.

### 2. Backend Setup

Navigate to the `backend` directory, install dependencies, and start the server:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following content:

```
JWT_SECRET=your_jwt_secret_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpass
```

**Note:** Replace `your_jwt_secret_key_here` with a strong, unique secret.

Start the backend server:

```bash
node server.js
```

The backend API will be running at `http://localhost:3000`.

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd ../frontend
npm install
npm run dev
```

Open your browser and navigate to the URL provided by Vite (e.g., `http://localhost:5173`).

## How to Run with Docker

To run this project using Docker, ensure you have Docker installed and running on your machine.

1.  Navigate to the project root directory (where the `docker-compose.yml` file is located).
2.  Run the following command to build and start the application containers:

    ```bash
    docker compose up --build
    ```

3.  The frontend will be accessible at `http://localhost`.

## How to Test (Backend)

To run the backend test cases, follow these steps:

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the tests using Jest:
   ```bash
   npm test
   ```
   This will execute the API endpoint tests located in the `tests` directory.

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
