const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data", "todos.json");


async function getData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return { todos: parsed, notes: [] };
    }
    return {
      todos: parsed.todos || [],
      notes: parsed.notes || [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { todos: [], notes: [] };
    }
    if (error instanceof SyntaxError) {
      return { todos: [], notes: [] };
    }
    throw error;
  }
}

async function saveData(data) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const toSave = {
      todos: data.todos || [],
      notes: data.notes || [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

async function readTodos() {
  const data = await getData();
  return data.todos;
}

async function writeTodos(todos) {
  const data = await getData();
  data.todos = todos;
  await saveData(data);
}

module.exports = {
  getData,
  saveData,
  readTodos,
  writeTodos,
};
