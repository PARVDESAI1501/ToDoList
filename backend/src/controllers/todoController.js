import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };
const ALLOWED_PRIORITIES = new Set(["high", "medium", "low"]);

const serializeTodo = (todo) => ({
  id: todo._id.toString(),
  title: todo.title,
  completed: Boolean(todo.completed),
  priority: todo.priority,
  category: todo.category,
  dueDate: todo.dueDate || "",
  createdAt: todo.createdAt,
});

const getTodos = async (req, res, next) => {
  try {
    const db = getDb();
    const { date } = req.query;
    const query = { userId: req.user.id };
    if (date) query.dueDate = date;

    const userTodos = await db.collection("todos").find(query).sort({ createdAt: -1 }).toArray();
    userTodos.sort((a, b) => {
      const priorityDifference = (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2);
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json({ success: true, count: userTodos.length, todos: userTodos.map(serializeTodo) });
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const { title, priority = "medium", category = "General", dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });
    if (!ALLOWED_PRIORITIES.has(priority)) return res.status(400).json({ message: "Invalid priority." });

    const db = getDb();
    const newTodo = {
      userId: req.user.id,
      title: title.trim(),
      completed: false,
      priority,
      category: typeof category === "string" ? category.trim() : "General",
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
    };

    const result = await db.collection("todos").insertOne(newTodo);
    return res.status(201).json({ success: true, todo: serializeTodo({ ...newTodo, _id: result.insertedId }) });
  } catch (error) {
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id." });

    const updates = {};
    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();
      if (!title) return res.status(400).json({ message: "Title is required." });
      updates.title = title;
    }
    if (typeof req.body.completed === "boolean") updates.completed = req.body.completed;
    if (req.body.priority !== undefined) {
      if (!ALLOWED_PRIORITIES.has(req.body.priority)) return res.status(400).json({ message: "Invalid priority." });
      updates.priority = req.body.priority;
    }
    if (typeof req.body.category === "string") updates.category = req.body.category.trim();
    if (typeof req.body.dueDate === "string") updates.dueDate = req.body.dueDate;
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid changes supplied." });

    const db = getDb();
    const result = await db.collection("todos").findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.user.id },
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!result) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json({ success: true, todo: serializeTodo(result) });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id." });

    const db = getDb();
    const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id), userId: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Task not found." });

    return res.status(200).json({ success: true, message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};

export { getTodos, createTodo, updateTodo, deleteTodo };
