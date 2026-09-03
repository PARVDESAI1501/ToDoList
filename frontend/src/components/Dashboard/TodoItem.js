import React, { useEffect, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";

const TodoItem = ({ todo, onToggle, onDelete, onUpdateTitle }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.title || "");

  useEffect(() => {
    setValue(todo.title || "");
  }, [todo.title]);

  const save = () => {
    const clean = value.trim();
    if (!clean) {
      setValue(todo.title || "");
      setEditing(false);
      return;
    }
    if (clean !== todo.title) onUpdateTitle(todo.id, clean);
    setEditing(false);
  };

  return (
    <article className="task-card-item">
      <button type="button" className="task-left" onClick={() => onToggle(todo.id, !todo.completed)}>
        <span className={`task-check ${todo.completed ? "checked" : ""}`}>
          {todo.completed && <Check size={13} strokeWidth={2.6} />}
        </span>

        <span className="task-copy">
          <span className={`priority-tag priority-${todo.priority || "medium"}`}>
            {todo.priority || "medium"}
          </span>

          {editing ? (
            <input
              className="task-edit-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={save}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
                if (event.key === "Escape") {
                  setValue(todo.title || "");
                  setEditing(false);
                }
              }}
              autoFocus
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <span className={`task-title ${todo.completed ? "strikethrough" : ""}`}>
              {todo.title}
            </span>
          )}

          {todo.dueDate && <span className="task-due">Due {todo.dueDate}</span>}
        </span>
      </button>

      <div className="task-actions">
        <button
          type="button"
          className="delete-task-btn"
          onClick={() => setEditing(true)}
          aria-label="Edit task"
          title="Edit task"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          className="delete-task-btn"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
};

export default TodoItem;
