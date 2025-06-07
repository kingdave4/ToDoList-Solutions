<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import TodoItem from "./components/TodoItem.vue";
import AddTodoModal from "./components/AddTodoModal.vue";
import LoginModal from "./components/LoginModal.vue";
import TodoControls from "./components/TodoControls.vue";

const todos = ref([]);
const loading = ref(false);
const error = ref(null);
const backendUrl = "http://localhost:3000";
const showModal = ref(false);
const showLoginModal = ref(false);
const currentTodo = ref(null);
const loginModalRef = ref(null);

// Auth state
const user = ref(null);
const isAuthenticated = computed(() => !!user.value);

const currentFilter = ref("all");
const sortBy = ref("createdAt");
const sortDirection = ref("desc");

// Helper function to handle authentication errors
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    handleLogout();
    showLoginModal.value = true;
    return true;
  }
  return false; 
};

async function fetchTodos() {
  if (!user.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${backendUrl}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    todos.value = response.data;
  } catch (err) {
    console.error("Error fetching todos:", err);
    if (handleAuthError(err)) {
      error.value = "Your session has expired. Please log in again.";
    } else {
      error.value = "Failed to load todos. Please ensure the backend is running.";
    }
    todos.value = [];
  } finally {
    loading.value = false;
  }
}

async function addTodo(payload) {
  if (!user.value) {
    showLoginModal.value = true;
    return;
  }

  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${backendUrl}/todos`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    todos.value.unshift(response.data);
    showModal.value = false;
  } catch (err) {
    console.error("Error adding todo:", err);
    if (handleAuthError(err)) {
      error.value = "Your session has expired. Please log in again.";
    } else {
      error.value = err.response?.data?.message || "Failed to add todo. Please try again.";
    }
  }
}

async function toggleComplete(todo) {
  if (!user.value) return;
  
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const updatedStatus = !todo.isCompleted;
    const response = await axios.patch(`${backendUrl}/todos/${todo.id}`, {
      isCompleted: updatedStatus,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const index = todos.value.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      todos.value[index].isCompleted = response.data.isCompleted;
    }
  } catch (err) {
    console.error("Error updating todo status:", err);
    if (handleAuthError(err)) {
      error.value = "Your session has expired. Please log in again.";
    } else {
      error.value = "Failed to update task status.";
    }
  }
}

async function deleteTodo(id) {
  if (!user.value) return;
  
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${backendUrl}/todos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    todos.value = todos.value.filter((t) => t.id !== id);
  } catch (err) {
    console.error("Error deleting todo:", err);
    if (handleAuthError(err)) {
      error.value = "Your session has expired. Please log in again.";
    } else {
      error.value = "Failed to delete task.";
    }
  }
}

async function editTodo(id) {
  error.value = null;
  try {
    const todo = todos.value.find(t => t.id === id);
    if (!todo) return;
    
    currentTodo.value = todo;
    showModal.value = true;
  } catch (err) {
    console.error("Error preparing todo edit:", err);
    error.value = "Failed to prepare task for editing.";
  }
}

async function handleEditTodo(payload) {
  if (!user.value) return;
  
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${backendUrl}/todos/${currentTodo.value.id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const index = todos.value.findIndex((t) => t.id === currentTodo.value.id);
    if (index !== -1) {
      todos.value[index] = response.data;
    }
    showModal.value = false;
    currentTodo.value = null;
  } catch (err) {
    console.error("Error editing todo:", err);
    if (handleAuthError(err)) {
      error.value = "Your session has expired. Please log in again.";
    } else {
      error.value = "Failed to edit task.";
    }
  }
}

// Auth functions
const handleLogin = async (userData) => {
  try {
    const response = await axios.post(`${backendUrl}/auth/login`, userData);
    const { token, user: userdata } = response.data;
    
    // Set authentication state first
    isAuthenticated.value = true;
    user.value = userdata;
    error.value = null;
    
    // Then store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userdata));
    
    // Close modal and fetch todos
    showLoginModal.value = false;
    
    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 0));
    await fetchTodos();
  } catch (error) {
    // Call the modal's error handler
    if (loginModalRef.value) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || "Failed to login";
      loginModalRef.value.handleError({ message: errorMessage });
    }
  }
};

async function handleSignup(userData) {
  try {
    const response = await axios.post(`${backendUrl}/auth/signup`, userData);
    
    isAuthenticated.value = true;
    user.value = response.data.user;
    error.value = null;
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));    

    showLoginModal.value = false;
    
    await new Promise(resolve => setTimeout(resolve, 0));
    await fetchTodos();
  } catch (err) {
    // Call the modal's error handler
    if (loginModalRef.value) {
      loginModalRef.value.handleError(err.response?.data || { message: "Failed to sign up" });
    }
  }
}

function handleLogout() {
  user.value = null;
  isAuthenticated.value = false;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  todos.value = [];
}

function handleAddTodoClick() {
  if (!isAuthenticated.value) {
    showLoginModal.value = true;
    return;
  }
  currentTodo.value = null;
  showModal.value = true;
}

// Initialize auth state from localStorage
onMounted(() => {
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  if (savedUser && savedToken) {
    user.value = JSON.parse(savedUser);
    isAuthenticated.value = true;
  }
  fetchTodos();
});

const filteredAndSortedTodos = computed(() => {
  let result = [...todos.value];

  if (currentFilter.value === "incomplete") {
    result = result.filter((todo) => !todo.isCompleted);
  } else if (currentFilter.value === "completed") {
    result = result.filter((todo) => todo.isCompleted);
  }

  result.sort((a, b) => {
    let valA, valB;

    if (sortBy.value === "dueDate") {
      valA = a.dueDate
        ? new Date(a.dueDate + "T00:00:00")
        : sortDirection.value === "asc"
        ? Infinity
        : -Infinity;
      valB = b.dueDate
        ? new Date(b.dueDate + "T00:00:00")
        : sortDirection.value === "asc"
        ? Infinity
        : -Infinity;
    } else {
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    }

    let comparison = 0;
    if (valA < valB) {
      comparison = -1;
    } else if (valA > valB) {
      comparison = 1;
    }

    return sortDirection.value === "desc" ? comparison * -1 : comparison;
  });

  return result;
});
</script>

<template>
  <div id="app">
    <div class="app-header">
      <h1>My To-Do List</h1>
      <div class="auth-section">
        <div v-if="isAuthenticated" class="user-info">
          <span class="welcome-text">Welcome, {{ user.name }}!</span>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
        <button v-else @click="showLoginModal = true" class="login-btn">Login</button>
      </div>
    </div>

    <div class="header-controls">
      <button @click="handleAddTodoClick" class="add-todo-btn">
        <span class="plus-icon">+</span> Add Todo
      </button>
      <TodoControls
        v-if="isAuthenticated"
        v-model:currentFilter="currentFilter"
        v-model:sortBy="sortBy"
        v-model:sortDirection="sortDirection"
      />
    </div>

    <AddTodoModal
      :show-modal="showModal"
      :todo="currentTodo"
      @close-modal="() => { showModal = false; currentTodo = null; }"
      @add-todo="addTodo"
      @edit-todo="handleEditTodo"
    />

    <LoginModal
      :show-modal="showLoginModal"
      @close-modal="showLoginModal = false"
      @login="handleLogin"
      @signup="handleSignup"
      ref="loginModalRef"
    />

    <div v-if="!isAuthenticated" class="auth-message">
      <p>Please <a href="#" @click.prevent="showLoginModal = true">login</a> to manage your todos.</p>
    </div>

    <div v-if="loading" class="loading-msg">Loading tasks...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <ul v-if="!loading && !error && isAuthenticated" class="todo-list">
      <TodoItem
        v-for="todo in filteredAndSortedTodos"
        :key="todo.id"
        :todo="todo"
        @toggle-complete="toggleComplete"
        @delete-todo="deleteTodo"
        @edit-todo="editTodo"
      />
      <li v-if="filteredAndSortedTodos.length === 0 && !loading" class="no-tasks">
        {{
          todos.length > 0 ? "No tasks match the current filter." : "No tasks yet! Add one above."
        }}
      </li>
    </ul>
  </div>
</template>

<style>
body {
  background-color: #1a1a1a;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

#app {
  margin-top: 40px;
  max-width: 850px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.app-header h1 {
  margin: 0;
}

h1 {
  text-align: center;
  color: #e0e0e0;
  margin-bottom: 30px;
  font-weight: 300;
  font-size: 2.5em;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  color: #ccc;
  font-size: 0.9em;
}

.login-btn, .logout-btn {
  padding: 8px 16px;
  border: 1px solid #42b983;
  background-color: transparent;
  color: #42b983;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.login-btn:hover, .logout-btn:hover {
  background-color: #42b983;
  color: white;
}

.auth-message {
  text-align: center;
  padding: 40px;
  color: #ccc;
}

.auth-message a {
  color: #42b983;
  text-decoration: none;
}

.auth-message a:hover {
  text-decoration: underline;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.add-todo-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}
.add-todo-btn:hover {
  background-color: #36a476;
}
.plus-icon {
  font-size: 1.2em;
  font-weight: bold;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin-top: 30px;
}

.no-tasks,
.loading-msg {
  text-align: center;
  color: #888;
  padding: 30px;
  font-size: 1.1em;
}

.error {
  color: #ff6b6b;
  text-align: center;
  margin: 15px 0;
  background-color: rgba(255, 107, 107, 0.1);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}
</style>
