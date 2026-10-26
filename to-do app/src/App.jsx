import { useEffect, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "todo-app:items";
const FILTERS = ["All", "Active", "Done"];

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* storage unavailable: app still works in memory */
    }
  }, [todos]);

  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  const addTodo = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos([{ id: crypto.randomUUID(), text: value, done: false }, ...todos]);
    setText("");
  };

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id));

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    const value = editText.trim();
    if (value) {
      setTodos(todos.map((t) => (t.id === editingId ? { ...t, text: value } : t)));
    } else {
      deleteTodo(editingId);
    }
    setEditingId(null);
  };

  const clearDone = () => setTodos(todos.filter((t) => !t.done));

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  const visible = todos.filter((t) =>
    filter === "All" ? true : filter === "Active" ? !t.done : t.done
  );

  const emptyMessage =
    todos.length === 0
      ? "Nothing here yet. Type a task above and press Add."
      : filter === "Active"
      ? "Everything is done. Nice work."
      : "No completed tasks yet.";

  return (
    <main className="app">
      <header className="app__header">
        <h1>Today</h1>
        <p className="app__count" aria-live="polite">
          {remaining} {remaining === 1 ? "task" : "tasks"} left
        </p>
      </header>

      <form className="add" onSubmit={addTodo}>
        <input
          className="add__input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task"
        />
        <button className="btn btn--primary" type="submit">
          Add
        </button>
      </form>

      <div className="filters" role="group" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filters__btn ${filter === f ? "is-active" : ""}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <ul className="list">
          {visible.map((todo) => (
            <li key={todo.id} className={`item ${todo.done ? "is-done" : ""}`}>
              <input
                className="item__check"
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.text}" as ${todo.done ? "not done" : "done"}`}
              />

              {editingId === todo.id ? (
                <input
                  ref={editRef}
                  className="item__edit"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  aria-label="Edit task"
                />
              ) : (
                <span
                  className="item__text"
                  onDoubleClick={() => startEdit(todo)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}

              <div className="item__actions">
                <button
                  className="btn btn--ghost"
                  onClick={() => startEdit(todo)}
                  aria-label={`Edit "${todo.text}"`}
                >
                  Edit
                </button>
                <button
                  className="btn btn--ghost btn--danger"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete "${todo.text}"`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {doneCount > 0 && (
        <footer className="app__footer">
          <button className="btn btn--ghost" onClick={clearDone}>
            Clear {doneCount} completed
          </button>
        </footer>
      )}
    </main>
  );
}