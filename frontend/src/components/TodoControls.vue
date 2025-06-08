<template>
  <div class="controls-container">
    <div class="filter-controls">
      <span>Filter:</span>
      <button @click="filterModel = 'all'" :class="{ active: filterModel === 'all' }">All</button>
      <button @click="filterModel = 'incomplete'" :class="{ active: filterModel === 'incomplete' }">
        Incomplete
      </button>
      <button @click="filterModel = 'completed'" :class="{ active: filterModel === 'completed' }">
        Completed
      </button>
    </div>
    <div class="sort-controls">
      <span>Sort by:</span>
      <select v-model="sortByModel" class="sort-select">
        <option value="createdAt">Added Date</option>
        <option value="dueDate">Due Date</option>
      </select>
      <select v-model="sortDirectionModel" class="sort-select">
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentFilter: {
    type: String,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  sortDirection: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:currentFilter", "update:sortBy", "update:sortDirection"]);

const filterModel = computed({
  get: () => props.currentFilter,
  set: (value) => emit("update:currentFilter", value),
});

const sortByModel = computed({
  get: () => props.sortBy,
  set: (value) => emit("update:sortBy", value),
});

const sortDirectionModel = computed({
  get: () => props.sortDirection,
  set: (value) => emit("update:sortDirection", value),
});
</script>

<style scoped>
.controls-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px 0px;
  font-size: 0.95em;
  flex-grow: 1;
  justify-content: flex-end;
}

.filter-controls,
.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.controls-container span {
  color: #aaa;
  margin-right: 5px;
}

.filter-controls button {
  padding: 6px 12px;
  border: 1px solid #555;
  background-color: transparent;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.filter-controls button:hover {
  background-color: #3a3a3a;
  border-color: #666;
}
.filter-controls button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.sort-select {
  padding: 6px 10px;
  border: 1px solid #444;
  background-color: #333;
  color: #e0e0e0;
  border-radius: 4px;
  font-size: 0.95em;
  cursor: pointer;
}
</style>
