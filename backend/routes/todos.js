const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readTodos, writeTodos } = require("../dataService");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (error) {
    console.error("Error reading todos:", error);
    res.status(500).json({ message: "Failed to retrieve todos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required and must be a non-empty string" });
    }

    const newTodo = {
      id: uuidv4(),
      title: title.trim(),
      description: description || "",
      dueDate: dueDate || null,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const todos = await readTodos();
    todos.push(newTodo);
    await writeTodos(todos);

    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Failed to create todo" });
  }
});

module.exports = router;
