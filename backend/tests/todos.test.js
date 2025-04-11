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
