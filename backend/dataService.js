const fs = require("fs/promises");
const path = require("path");

const TODOS_FILE = path.join(__dirname, "data", "todos.json");

async function readTodos() {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    if (error instanceof SyntaxError) {
      console.error("Error parsing todos.json:", error);
      return [];
    }
    throw error;
  }
}

async function writeTodos(todos) {
  try {
    await fs.mkdir(path.dirname(TODOS_FILE), { recursive: true });
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to todos.json:", error);
    throw error;
  }
}

module.exports = {
  readTodos,
  writeTodos,
};
