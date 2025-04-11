const request = require("supertest");
const express = require("express");
const todoRoutes = require("../routes/todos");
const dataService = require("../dataService");

jest.mock("../dataService");

const app = express();
app.use(express.json());
app.use("/todos", todoRoutes);

describe("Todo API - GET Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /todos", () => {
    it("should return an array of todos", async () => {
      const mockTodos = [{ id: "1", title: "Test Todo 1", isCompleted: false }];
      dataService.readTodos.mockResolvedValue(mockTodos);

      const res = await request(app).get("/todos");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockTodos);
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no todos exist", async () => {
      dataService.readTodos.mockResolvedValue([]);

      const res = await request(app).get("/todos");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it("should return 500 if reading todos fails", async () => {
      dataService.readTodos.mockRejectedValue(new Error("Read error"));

      const res = await request(app).get("/todos");
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to retrieve todos" });
    });
  });

  describe("GET /todos/:id", () => {
    it("should return a single todo if found", async () => {
      const mockTodo = { id: "1", title: "Found Todo", isCompleted: true };
      dataService.readTodos.mockResolvedValue([mockTodo, { id: "2", title: "Other" }]);

      const res = await request(app).get("/todos/1");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockTodo);
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if todo is not found", async () => {
      dataService.readTodos.mockResolvedValue([{ id: "2", title: "Other" }]);

      const res = await request(app).get("/todos/1");
      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: "Todo not found" });
    });

    it("should return 500 if reading todos fails", async () => {
      dataService.readTodos.mockRejectedValue(new Error("Read error"));

      const res = await request(app).get("/todos/1");
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to retrieve todo" });
    });
  });
});

describe("Todo API - POST Endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataService.readTodos.mockResolvedValue([]);
    dataService.writeTodos.mockResolvedValue();
  });

  describe("POST /todos", () => {
    it("should create a new todo and return it", async () => {
      const newTodoData = { title: "  New Task  ", description: "Details", dueDate: "2025-12-31" };
      const expectedSavedTodo = {
        id: expect.any(String),
        title: "New Task",
        description: "Details",
        dueDate: "2025-12-31",
        isCompleted: false,
        createdAt: expect.any(String),
      };

      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchObject(expectedSavedTodo);
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).toHaveBeenCalledWith([
        expect.objectContaining(expectedSavedTodo),
      ]);
    });

    it("should create a todo with minimal data (only title)", async () => {
      const newTodoData = { title: "Minimal Task" };
      const expectedSavedTodo = {
        id: expect.any(String),
        title: "Minimal Task",
        description: "",
        dueDate: null,
        isCompleted: false,
        createdAt: expect.any(String),
      };

      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchObject(expectedSavedTodo);
      expect(dataService.writeTodos).toHaveBeenCalledWith([
        expect.objectContaining(expectedSavedTodo),
      ]);
    });

    it("should return 400 if title is missing", async () => {
      const newTodoData = { description: "No title" };
      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 400 if title is an empty string", async () => {
      const newTodoData = { title: "" };
      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
    });

    it("should return 400 if title is just whitespace", async () => {
      const newTodoData = { title: "   " };
      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
    });

    it("should return 500 if writing todos fails", async () => {
      dataService.writeTodos.mockRejectedValue(new Error("Write error"));
      const newTodoData = { title: "Valid Task" };

      const res = await request(app).post("/todos").send(newTodoData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to create todo" });
    });
  });
});
