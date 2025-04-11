const express = require("express");
const { readTodos } = require("../dataService");
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

module.exports = router;
