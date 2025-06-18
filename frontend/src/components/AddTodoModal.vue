<template>
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>{{ todo ? 'Edit Task' : 'Add New Task' }}</h2>
      <form @submit.prevent="handleSubmit" class="add-form modal-form">
        <div class="form-group">
          <label for="modal-todo-title">Task Title*</label>
          <input
            type="text"
            id="modal-todo-title"
            v-model="newTodoTitle"
            placeholder="e.g., Read chapter 5..."
            class="form-input"
            aria-describedby="modal-title-error"
            required
          />
          <p v-if="titleError" id="modal-title-error" class="input-error">{{ titleError }}</p>
        </div>

        <div class="form-group">
          <label for="modal-todo-description">Description</label>
          <textarea
            id="modal-todo-description"
            v-model="newTodoDescription"
            placeholder="More details..."
            class="form-input description-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="modal-todo-due-date">Due Date</label>
          <input
            type="date"
            id="modal-todo-due-date"
            v-model="newTodoDueDate"
            class="form-input date-input"
          />
        </div>

        <div class="form-group">
          <label for="modal-todo-priority">Priority</label>
          <select
            id="modal-todo-priority"
            v-model="newTodoPriority"
            class="form-input priority-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <!-- Subtasks Section -->
        <div class="form-group">
          <label class="subtasks-label">Subtasks / Checklist</label>
          <div class="subtasks-container">
            <div v-for="(subtask, index) in subtasks" :key="subtask.id" class="subtask-item">
              <div class="subtask-input-container">
                <input
                  type="text"
                  v-model="subtask.title"
                  placeholder="Enter subtask..."
                  class="subtask-input"
                  @blur="updateSubtask(index)"
                />
                <button
                  type="button"
                  @click="removeSubtask(index)"
                  class="remove-subtask-btn"
                  title="Remove subtask"
                >
                  ×
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="addSubtask"
              class="add-subtask-btn"
            >
              + Add Subtask
            </button>
          </div>
          <div v-if="subtasks.length > 0" class="subtask-options">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="autoCompleteOnAllSubtasks"
                class="checkbox-input"
              />
              <span class="checkbox-text">Auto-complete main task when all subtasks are done</span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button type="submit" class="form-button create-button">
            {{ todo ? 'Save Changes' : 'Create' }}
          </button>
          <button type="button" @click="closeModal" class="form-button cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../composables/useAuth";

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  todo: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close-modal"]);

const { user } = useAuth();

const newTodoTitle = ref("");
const newTodoDescription = ref("");
const newTodoDueDate = ref("");
const newTodoPriority = ref("low");
const titleError = ref("");

// Subtasks management
const subtasks = ref([]);
const autoCompleteOnAllSubtasks = ref(true);

const addSubtask = () => {
  subtasks.value.push({
    id: uuidv4(),
    title: "",
    isCompleted: false,
    createdAt: new Date().toISOString()
  });
};

const removeSubtask = (index) => {
  subtasks.value.splice(index, 1);
};

const updateSubtask = (index) => {
  const subtask = subtasks.value[index];
  if (!subtask.title.trim()) {
    removeSubtask(index);
  }
};

watch(
  () => props.showModal,
  (newValue) => {
    if (newValue) {
      if (props.todo) {
        newTodoTitle.value = props.todo.title;
        newTodoDescription.value = props.todo.description || "";
        newTodoDueDate.value = props.todo.dueDate || "";
        newTodoPriority.value = props.todo.priority || "low";
        subtasks.value = props.todo.subtasks ? [...props.todo.subtasks] : [];
        autoCompleteOnAllSubtasks.value = props.todo.autoCompleteOnAllSubtasks !== false;
      } else {
        newTodoTitle.value = "";
        newTodoDescription.value = "";
        newTodoDueDate.value = "";
        newTodoPriority.value = "low";
        subtasks.value = [];
        autoCompleteOnAllSubtasks.value = true;
      }
      titleError.value = "";
    }
  }
);

const handleSubmit = async () => {
  titleError.value = "";
  if (!newTodoTitle.value.trim()) {
    titleError.value = "Title is required";
    return;
  }

  const validSubtasks = subtasks.value.filter(subtask => subtask.title.trim());

  const todoData = {
    title: newTodoTitle.value.trim(),
    description: newTodoDescription.value.trim() || null,
    dueDate: newTodoDueDate.value || null,
    priority: newTodoPriority.value,
    createdAt: new Date().toISOString(),
    isCompleted: props.todo ? props.todo.isCompleted : false,
    userId: user.value?.userId,
    subtasks: validSubtasks,
    autoCompleteOnAllSubtasks: autoCompleteOnAllSubtasks.value,
  };

  try {
    if (props.todo) {
      // Edit mode
      const todoRef = doc(db, "todos", props.todo.id);
      await updateDoc(todoRef, todoData);
    } else {
      const newTodoId = uuidv4();
      const todoRef = doc(db, "todos", newTodoId);
      await setDoc(todoRef, { ...todoData, id: newTodoId });
    }
    closeModal();
  } catch (e) {
    console.error("Error adding/updating document: ", e);
  }
};

const closeModal = () => {
  emit("close-modal");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #252525;
  padding: 30px 40px;
  border-radius: 8px;
  border: 1px solid #444;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 400;
  color: #eee;
}

.modal-form .form-group {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.modal-actions .form-button {
  padding: 10px 20px;
}

.cancel-button {
  background-color: #555;
  border-color: #444;
}
.cancel-button:hover {
  background-color: #666;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #ccc;
  font-size: 0.9em;
  font-weight: 500;
}

.form-input {
  padding: 12px 15px;
  border: 1px solid #444;
  background-color: #333;
  color: #e0e0e0;
  border-radius: 4px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}
.form-input::placeholder {
  color: #888;
}

.description-input {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}
.date-input {
  min-width: 140px;
}

.priority-select {
  min-width: 140px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 30px;
}

.input-error {
  color: #ff8a8a;
  font-size: 0.85em;
  margin-top: 5px;
  margin-bottom: 0;
}

/* Subtasks Styles */
.subtasks-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px !important;
}

.subtasks-label::before {
  content: "📋";
  font-size: 1.1em;
}

.subtasks-container {
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.subtask-item {
  margin-bottom: 10px;
}

.subtask-item:last-child {
  margin-bottom: 0;
}

.subtask-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.subtask-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #555;
  background-color: #333;
  color: #e0e0e0;
  border-radius: 4px;
  font-size: 0.9em;
}

.subtask-input:focus {
  outline: none;
  border-color: #42b983;
}

.subtask-input::placeholder {
  color: #999;
}

.remove-subtask-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.remove-subtask-btn:hover {
  background-color: #ff5252;
}

.add-subtask-btn {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.add-subtask-btn:hover {
  background-color: #369870;
}

.subtask-options {
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9em;
  color: #ccc;
}

.checkbox-input {
  accent-color: #42b983;
  width: 16px;
  height: 16px;
}

.checkbox-text {
  user-select: none;
}

/* Form Button Styles */
.form-button {
  background-color: #42b983;
  color: white;
  border: 1px solid #42b983;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.form-button:hover {
  background-color: #369870;
  border-color: #369870;
}

.create-button {
  background-color: #42b983;
  border-color: #42b983;
}

.create-button:hover {
  background-color: #369870;
  border-color: #369870;
}
</style>
