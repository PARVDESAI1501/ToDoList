import React, { useState } from "react";
import { Plus } from "lucide-react";

const TodoForm = ({ onAddTodo }) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = title.trim();
    if (!value || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTodo(value);
      setTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a new task…"
        autoComplete="off"
        disabled={isSubmitting}
      />
      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !title.trim()}>
        <Plus size={16} />
        {isSubmitting ? "Adding…" : "Add Task"}
      </button>
    </form>
  );
};

export default TodoForm;
