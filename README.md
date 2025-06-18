# Todo Application

A full-stack Todo application with Vue 3 frontend and Node.js backend, featuring user authentication and task management.

## ✨ Features

- 📝 Create, edit, and delete todos
- ✅ Mark tasks as complete/incomplete
- 🔐 User authentication (register/login)
- 🎨 Modern Vue 3 + Vite frontend
- 🚀 Express.js backend API
- 🐳 Docker support

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker and Docker Compose installed

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd ToDoList-Solutions
   ```

2. **Run with Docker Compose:**

   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

### Option 2: Local Development

**Prerequisites:** Node.js (v16+) and npm installed

#### Backend Setup

1. **Navigate to backend and install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Create environment file (optional but recommended):**

   ```bash
   # Create .env file in backend directory
   echo "JWT_SECRET=your_secure_jwt_secret_here" > .env
   echo "PORT=3000" >> .env
   ```

3. **Start the backend server:**
   ```bash
   npm start
   # or for development
   node server.js
   ```
   Backend runs at: http://localhost:3000

#### Frontend Setup

1. **Open new terminal and navigate to frontend:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs at: http://localhost:5173

## 🐳 Docker Instructions

### Full Application (Backend + Frontend)

```bash
# Build and run both services
docker compose up --build

# Run in background
docker compose up -d --build

# Stop services
docker compose down
```

### Individual Services

#### Backend Only

```bash
cd backend
docker build -t todo-backend .
docker run -p 3000:3000 todo-backend
```

#### Frontend Only

```bash
cd frontend
docker build -t todo-frontend .
docker run -p 80:80 todo-frontend
```

## 🧪 Testing

Run backend tests:

```bash
cd backend
npm test
```

## 🔧 Configuration

### Environment Variables

The backend uses these optional environment variables:

| Variable     | Default             | Description                                   |
| ------------ | ------------------- | --------------------------------------------- |
| `PORT`       | `3000`              | Backend server port                           |
| `JWT_SECRET` | `"your-secret-key"` | JWT signing secret (⚠️ Change in production!) |

### Security Note

⚠️ **Important:** The default JWT secret is insecure. Always set a strong `JWT_SECRET` in production:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📁 Project Structure

```
ToDoList-Solutions/
├── backend/                 # Express.js API
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── tests/             # Test files
│   └── server.js          # Entry point
├── frontend/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/    # Vue components
│   │   └── composables/   # Vue composables
│   └── public/
├── docker-compose.yml     # Multi-service setup
└── README.md
```

## 🏗️ Architecture & Design

### Backend

- **Framework:** Express.js for RESTful API
- **Authentication:** JWT with bcrypt password hashing
- **Data Storage:** JSON file (development) - easily replaceable with database
- **Testing:** Jest + Supertest for API testing

### Frontend

- **Framework:** Vue 3 with Composition API
- **Build Tool:** Vite for fast development
- **Styling:** Modern CSS with responsive design
- **State Management:** Vue composables for auth state

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes with middleware
- CORS configuration for cross-origin requests

## 🔗 API Endpoints

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/login`    | User login        |
| `GET`  | `/`              | Health check      |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
