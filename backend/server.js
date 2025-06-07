const express = require("express");
const cors = require("cors");
const todoRoutes = require("./routes/todos");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Todo Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
