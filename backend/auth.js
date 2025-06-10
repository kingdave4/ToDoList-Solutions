const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readUsers, writeUsers } = require("./userService");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

async function registerUser(name, email, password) {
  const users = await readUsers();
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { userId: newUser.id, token, name: newUser.name };
}

async function loginUser(email, password) {
  const users = await readUsers();
  const user = users.find((user) => user.email === email);
  if (!user) {
    throw new Error("No account found with this email");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return { userId: user.id, token, name: user.name };
}

module.exports = { registerUser, loginUser };
