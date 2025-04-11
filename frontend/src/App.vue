<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const todos = ref([]);
const loading = ref(false);
const error = ref(null);
const backendUrl = "http://localhost:3000";
const showAddModal = ref(false);

async function fetchTodos() {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${backendUrl}/todos`);
    todos.value = response.data;
  } catch (err) {
    console.error("Error fetching todos:", err);
    error.value = "Failed to load todos. Please ensure the backend is running.";
    todos.value = [];
  } finally {
    loading.value = false;
  }
}

async function addTodo(payload) {
  error.value = null;
  try {
    const response = await axios.post(`${backendUrl}/todos`, payload);
    todos.value.unshift(response.data);
    showAddModal.value = false;
  } catch (err) {
    console.error("Error adding todo:", err);
    error.value = err.response?.data?.message || "Failed to add todo. Please try again.";
  }
}

onMounted(fetchTodos);

const filteredAndSortedTodos = computed(() => todos.value);
</script>

<template>
  <div id="app">
    <h1>My To-Do List</h1>

    <div class="header-controls">
      <button @click="showAddModal = true" class="add-todo-btn">
        <span class="plus-icon">+</span> Add Todo
      </button>
    </div>

    <div v-if="loading" class="loading-msg">Loading tasks...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <ul v-if="!loading && !error" class="todo-list">
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

h1 {
  text-align: center;
  color: #e0e0e0;
  margin-bottom: 30px;
  font-weight: 300;
  font-size: 2.5em;
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
