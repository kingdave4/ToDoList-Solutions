const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const {userId, token, name: userName } = await registerUser(name, email, password);
    res.status(201).json({ userId, token, name: userName });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { userId, token, name } = await loginUser(email, password);
    res.json({ userId, token, name });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
