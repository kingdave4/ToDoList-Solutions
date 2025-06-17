<template>
  <li class="todo-card" :class="{ completed: todo.isCompleted }">
    <div class="todo-details">
      <div class="todo-header">
        <span class="todo-title">{{ todo.title }}</span>
        <span class="priority-badge" :class="getPriorityClass(todo.priority)">
          {{ getPriorityText(todo.priority) }}
        </span>
      </div>
      <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
      <div class="todo-meta-info">
        <span v-if="todo.dueDate">Due: {{ formatDate(todo.dueDate) }}</span>
        <span>Added: {{ formatDate(todo.createdAt) }}, {{ formatTime(todo.createdAt) }}</span>
      </div>
    </div>
    <div class="todo-actions">
      <button @click="handleToggleComplete" class="complete-btn">
        {{ todo.isCompleted ? "Mark Incomplete" : "Mark Complete" }}
      </button>
      <button @click="handleDelete" class="delete-btn">Delete</button>
      <button @click="handleEdit" class="edit-btn" :disabled="todo.isCompleted">Edit</button>
    </div>
  </li>
</template>

<script setup>
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit-todo"]);

function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  const date = new Date(dateString.includes("T") ? dateString : dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, options);
}

function formatTime(dateString) {
  if (!dateString) return "";
  const options = { hour: "numeric", minute: "2-digit", hour12: true };
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, options);
}

function getPriorityClass(priority) {
  if (priority === 'high') return 'priority-high';
  if (priority === 'medium') return 'priority-medium';
  return 'priority-low';
}

function getPriorityText(priority) {
  if (priority === 'high') return 'High Priority';
  if (priority === 'medium') return 'Medium Priority';
  return 'Low Priority';
}

const handleToggleComplete = async () => {
  try {
    const todoRef = doc(db, "todos", props.todo.id);
    await updateDoc(todoRef, {
      isCompleted: !props.todo.isCompleted,
    });
    console.log("Todo completion toggled for ID: ", props.todo.id);
  } catch (e) {
    console.error("Error toggling todo completion: ", e);
  }
};

const handleDelete = async () => {
  try {
    await deleteDoc(doc(db, "todos", props.todo.id));
    console.log("Todo deleted with ID: ", props.todo.id);
  } catch (e) {
    console.error("Error deleting todo: ", e);
  }
};

const handleEdit = () => {
  emit("edit-todo", props.todo.id);
};
</script>


<style scoped>
.todo-card {
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 20px 25px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
  transition: background-color 0.3s ease;
}

.todo-details {
  flex-grow: 1;
  margin-right: 15px;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.todo-title {
  font-weight: 600;
  font-size: 1.3em;
  color: #f0f0f0;
  word-break: break-word;
}

.priority-badge {
  font-size: 0.7em;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-high {
  background-color: #ff6b6b;
  color: white;
}

.priority-medium {
  background-color: #ffd93d;
  color: #333;
}

.priority-low {
  background-color: #6bcf7f;
  color: white;
}

.todo-description {
  font-size: 1em;
  color: #bbb;
  margin-bottom: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.todo-meta-info {
  font-size: 0.85em;
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  align-self: center;
}
.todo-actions button {
  padding: 8px 15px;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}
.complete-btn {
  background-color: transparent;
  color: #ccc;
}
.complete-btn:hover {
  background-color: #3a3a3a;
  border-color: #666;
}
.delete-btn {
  background-color: #d9534f;
  color: white;
  border: 1px solid #d43f3a;
}
.delete-btn:hover {
  background-color: #c9302c;
  border-color: #ac2925;
}
.edit-btn {
  background-color: #28a745;
  color: white;
  border: 1px solid #218838;
}
.edit-btn:hover {
  background-color: #218838;
  border-color: #1e7e34;
}
.edit-btn:disabled {
  opacity: 0.1;
  cursor: not-allowed;
}
.todo-card.completed {
  background-color: #222;
  border-left: 5px solid #42b983;
  padding-left: 20px;
}
.todo-card.completed .todo-title,
.todo-card.completed .todo-description {
  text-decoration: line-through;
  color: #777;
}
.todo-card.completed .todo-meta-info {
  color: #666;
}
.todo-card.completed .priority-badge {
  opacity: 0.7;
}
</style>
