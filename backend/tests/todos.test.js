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

describe("Todo API - PUT/PATCH Endpoints", () => {
  let mockTodos;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup initial mock data for update/patch tests
    mockTodos = [
      {
        id: "1",
        title: "Task One",
        description: "Desc One",
        dueDate: "2025-01-01",
        isCompleted: false,
        createdAt: "2025-01-01T10:00:00Z",
      },
      {
        id: "2",
        title: "Task Two",
        description: "Desc Two",
        dueDate: null,
        isCompleted: true,
        createdAt: "2025-01-02T10:00:00Z",
      },
    ];
    dataService.readTodos.mockResolvedValue(mockTodos);
    dataService.writeTodos.mockResolvedValue(); // Assume write succeeds unless specified otherwise
  });

  describe("PUT /todos/:id", () => {
    it("should update an existing todo and return it", async () => {
      const updateData = {
        title: "Updated Task One",
        description: "New Desc",
        dueDate: "2025-02-01",
      };
      const expectedUpdatedTodo = {
        ...mockTodos[0], // Keep original id, isCompleted, createdAt
        title: "Updated Task One",
        description: "New Desc",
        dueDate: "2025-02-01",
      };

      const res = await request(app).put("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectedUpdatedTodo);
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      // Check that writeTodos was called with the updated list
      const writeCallArg = dataService.writeTodos.mock.calls[0][0];
      expect(writeCallArg).toContainEqual(expectedUpdatedTodo);
      expect(writeCallArg).toContainEqual(mockTodos[1]); // Ensure other todos are still present
      expect(writeCallArg.length).toBe(2);
    });

    it("should only update provided fields", async () => {
      const updateData = { title: "  Only Title Updated  " };
      const expectedUpdatedTodo = {
        ...mockTodos[0],
        title: "Only Title Updated", // Trimmed
      };

      const res = await request(app).put("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectedUpdatedTodo);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      const writeCallArg = dataService.writeTodos.mock.calls[0][0];
      expect(writeCallArg).toContainEqual(expectedUpdatedTodo);
    });

    it("should return 404 if todo to update is not found", async () => {
      const updateData = { title: "Does not matter" };
      const res = await request(app)
        .put("/todos/999") // Non-existent ID
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: "Todo not found" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 400 if title is provided but empty", async () => {
      const updateData = { title: "" };
      const res = await request(app).put("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Title must be a non-empty string" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 400 if title is provided but only whitespace", async () => {
      const updateData = { title: "   " };
      const res = await request(app).put("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Title must be a non-empty string" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 500 if writing todos fails during update", async () => {
      dataService.writeTodos.mockRejectedValue(new Error("Write error"));
      const updateData = { title: "Valid Update" };

      const res = await request(app).put("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to update todo" });
    });
  });

  describe("PATCH /todos/:id", () => {
    it("should update the completion status to true", async () => {
      const updateData = { isCompleted: true };
      const expectedUpdatedTodo = { ...mockTodos[0], isCompleted: true };

      const res = await request(app)
        .patch("/todos/1") // Target the first todo which is initially false
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectedUpdatedTodo);
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      const writeCallArg = dataService.writeTodos.mock.calls[0][0];
      expect(writeCallArg).toContainEqual(expectedUpdatedTodo);
      expect(writeCallArg.length).toBe(2);
    });

    it("should update the completion status to false", async () => {
      const updateData = { isCompleted: false };
      const expectedUpdatedTodo = { ...mockTodos[1], isCompleted: false }; // Target the second todo which is initially true

      const res = await request(app).patch("/todos/2").send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectedUpdatedTodo);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      const writeCallArg = dataService.writeTodos.mock.calls[0][0];
      expect(writeCallArg).toContainEqual(expectedUpdatedTodo);
    });

    it("should return 404 if todo to patch is not found", async () => {
      const updateData = { isCompleted: true };
      const res = await request(app).patch("/todos/999").send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: "Todo not found" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 400 if isCompleted is not a boolean", async () => {
      const updateData = { isCompleted: "not-a-boolean" };
      const res = await request(app).patch("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "isCompleted must be a boolean value" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 400 if isCompleted is missing", async () => {
      const updateData = {}; // Missing isCompleted
      const res = await request(app).patch("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "isCompleted must be a boolean value" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 500 if writing todos fails during patch", async () => {
      dataService.writeTodos.mockRejectedValue(new Error("Write error"));
      const updateData = { isCompleted: true };

      const res = await request(app).patch("/todos/1").send(updateData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to update todo completion status" });
    });
  });
});

describe("Todo API - DELETE Endpoint", () => {
  let mockTodos;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTodos = [
      { id: "1", title: "To Delete", isCompleted: false },
      { id: "2", title: "To Keep", isCompleted: true },
    ];
    dataService.readTodos.mockResolvedValue(mockTodos);
    dataService.writeTodos.mockResolvedValue();
  });

  describe("DELETE /todos/:id", () => {
    it("should delete a todo and return 204", async () => {
      const res = await request(app).delete("/todos/1");

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({}); // No content on success
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1);
      // Check that writeTodos was called with the correct remaining todo
      expect(dataService.writeTodos).toHaveBeenCalledWith([mockTodos[1]]);
    });

    it("should return 404 if todo to delete is not found", async () => {
      const res = await request(app).delete("/todos/999"); // Non-existent ID

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: "Todo not found" });
      expect(dataService.readTodos).toHaveBeenCalledTimes(1);
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 500 if reading todos fails during delete", async () => {
      dataService.readTodos.mockRejectedValue(new Error("Read error"));
      const res = await request(app).delete("/todos/1");

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to delete todo" });
      expect(dataService.writeTodos).not.toHaveBeenCalled();
    });

    it("should return 500 if writing todos fails during delete", async () => {
      dataService.writeTodos.mockRejectedValue(new Error("Write error"));
      const res = await request(app).delete("/todos/1");

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Failed to delete todo" });
      expect(dataService.writeTodos).toHaveBeenCalledTimes(1); // Write was attempted
    });
  });
});
