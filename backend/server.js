const express = require("express");
const cors = require("cors");
const todoRoutes = require("./routes/todos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);

app.get("/", (req, res) => {
  res.send("Todo Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
