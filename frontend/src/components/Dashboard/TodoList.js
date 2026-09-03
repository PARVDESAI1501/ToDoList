import React from "react";
import TodoItem from "./TodoItem";

const TodoList = ({ todos, loading, onToggle, onDelete, onUpdateTitle }) => {
  if (loading) {
    return <div className="empty-state">Synchronizing tasks…</div>;
  }

  if (!todos?.length) {
    return <div className="empty-state">No tasks scheduled for this day.</div>;
  }

  return (
    <div className="tasks-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdateTitle={onUpdateTitle}
        />
      ))}
    </div>
  );
};

export default TodoList;
