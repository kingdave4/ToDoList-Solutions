<script setup>
import { ref, watch } from "vue";

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

const emit = defineEmits(["close-modal", "add-todo", "edit-todo"]);

const newTodoTitle = ref("");
const newTodoDescription = ref("");
const newTodoDueDate = ref("");
const titleError = ref("");

watch(
  () => props.showModal,
  (newValue) => {
    if (newValue) {
      if (props.todo) {
        // Edit mode
        newTodoTitle.value = props.todo.title;
        newTodoDescription.value = props.todo.description || "";
        newTodoDueDate.value = props.todo.dueDate || "";
      } else {
        // Add mode
        newTodoTitle.value = "";
        newTodoDescription.value = "";
        newTodoDueDate.value = "";
      }
      titleError.value = "";
    }
  }
);

const handleSubmit = () => {
  titleError.value = "";
  if (!newTodoTitle.value.trim()) {
    titleError.value = "Title is required";
    return;
  }

  const payload = {
    title: newTodoTitle.value.trim(),
    description: newTodoDescription.value.trim() || null,
    dueDate: newTodoDueDate.value || null,
  };

  if (props.todo) {
    emit("edit-todo", { ...payload, isCompleted: props.todo.isCompleted });
  } else {
    emit("add-todo", payload);
  }
};

const closeModal = () => {
  emit("close-modal");
};
</script>

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
  max-width: 500px;
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

.input-error {
  color: #ff8a8a;
  font-size: 0.85em;
  margin-top: 5px;
  min-height: 1.2em;
}

input[type="date"].form-input:invalid {
  color: #888;
}
input[type="date"].form-input {
  appearance: none;
  -webkit-appearance: none;
}

.form-button {
  padding: 12px 20px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1em;
  white-space: nowrap;
}
.form-button:hover {
  background-color: #36a476;
}
</style>
