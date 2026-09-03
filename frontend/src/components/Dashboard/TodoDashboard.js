import React, { useEffect, useMemo, useState } from "react";
import { Flame, LogOut, Trash2, UserRound, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "./BottomNav";
import TodoList from "./TodoList";
import { api } from "../../services/api";

const pad = (value) => String(value).padStart(2, "0");
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const normalizeDate = (value) => (typeof value === "string" ? value.slice(0, 10) : "");

const TodoDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [filterMode, setFilterMode] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [calendarHovered, setCalendarHovered] = useState(false);
  const [calendarLocked, setCalendarLocked] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [lockedDate, setLockedDate] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [lockedBar, setLockedBar] = useState(null);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        iso: formatDate(date),
        initial: date.toLocaleDateString("en-US", { weekday: "narrow" }),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        num: date.getDate(),
      };
    }),
    [today.getFullYear(), today.getMonth(), today.getDate()],
  );

  const loadTodos = async () => {
    try {
      const response = await api.get("/api/todos");
      setTodos(Array.isArray(response?.todos) ? response.todos : []);
      setError("");
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to synchronize tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
    const interval = window.setInterval(loadTodos, 4000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (params.get("create") === "1") {
      setShowCreate(true);
      params.delete("create");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    const outside = (event) => {
      if (
        showProfile &&
        !event.target.closest(".profile-popup") &&
        !event.target.closest(".user-profile-chip")
      ) {
        setShowProfile(false);
      }
      if (calendarLocked && !event.target.closest(".calendar-strip-card")) {
        setCalendarLocked(false);
        setCalendarHovered(false);
      }
      if (lockedDate && !event.target.closest(`[data-week-date="${lockedDate}"]`)) {
        setLockedDate(null);
        setHoveredDate(null);
      }
      if (lockedBar && !event.target.closest(`[data-activity-date="${lockedBar}"]`)) {
        setLockedBar(null);
        setHoveredBar(null);
      }
    };

    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [showProfile, lockedDate, lockedBar]);

  const userName = user?.name || user?.fullName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const initial = userName.charAt(0).toUpperCase() || "U";

  const groupedByDate = useMemo(() => {
    const map = {};
    todos.forEach((todo) => {
      const date = normalizeDate(todo.dueDate);
      if (!date) return;
      if (!map[date]) map[date] = [];
      map[date].push(todo);
    });
    return map;
  }, [todos]);

  const dayTasks = useMemo(() => {
    const list = groupedByDate[selectedDate] || [];
    if (filterMode === "active") return list.filter((todo) => !todo.completed);
    if (filterMode === "done") return list.filter((todo) => todo.completed);
    return list;
  }, [groupedByDate, selectedDate, filterMode]);

  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;
  const completion = total ? Math.round((completed / total) * 100) : 0;

  const activity = weekDays.map((day) => {
    const tasks = groupedByDate[day.iso] || [];
    const done = tasks.filter((todo) => todo.completed).length;
    return {
      ...day,
      scheduled: tasks.length,
      done,
      rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  });

  const createTask = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    try {
      const response = await api.post("/api/todos", {
        title: cleanTitle,
        priority,
        dueDate: selectedDate,
        category: "General",
      });

      if (response?.todo) {
        setTodos((current) => [response.todo, ...current]);
      } else {
        await loadTodos();
      }

      setTitle("");
      setPriority("medium");
      setShowCreate(false);
      setError("");
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to create task.");
    }
  };

  const toggleTodo = async (id, completedValue) => {
    try {
      const response = await api.put(`/api/todos/${id}`, { completed: completedValue });
      if (response?.todo) {
        setTodos((current) => current.map((todo) => (todo.id === id ? response.todo : todo)));
      } else {
        await loadTodos();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to update task.");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to delete task.");
    }
  };

  const updateTitle = async (id, nextTitle) => {
    try {
      const response = await api.put(`/api/todos/${id}`, { title: nextTitle });
      if (response?.todo) {
        setTodos((current) => current.map((todo) => (todo.id === id ? response.todo : todo)));
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to update task title.");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="saas-wrapper">
      <header className="ios-top-bar-centered">
        <button type="button" className="user-profile-chip" onClick={() => setShowProfile(true)}>
          <span className="user-avatar-badge">{initial}</span>
          <span className="user-text-details">
            <span className="app-title-bold">{userName}</span>
            <span className="user-email-subtitle">{email}</span>
          </span>
        </button>
        <button type="button" className="icon-signout-btn" onClick={logout} aria-label="Sign out" title="Sign out">
          <LogOut size={17} />
        </button>
      </header>

      <section
        className={`calendar-strip-card ${calendarHovered || calendarLocked ? "expanded" : ""}`}
        onMouseEnter={() => setCalendarHovered(true)}
        onMouseLeave={() => {
          if (!calendarLocked) setCalendarHovered(false);
        }}
        onClick={() => {
          setCalendarLocked(true);
          setCalendarHovered(true);
        }}
      >
        <div className="calendar-header">
          <div>
            <span className="page-eyebrow">Schedule</span>
            <h3>{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
          </div>
        </div>

        <div className="calendar-days-row">
          {weekDays.map((day) => {
            const expanded = hoveredDate === day.iso || lockedDate === day.iso;
            return (
              <button
                type="button"
                key={day.iso}
                data-week-date={day.iso}
                className={`day-pill ${selectedDate === day.iso ? "active" : ""}`}
                onMouseEnter={() => setHoveredDate(day.iso)}
                onMouseLeave={() => lockedDate !== day.iso && setHoveredDate(null)}
                onClick={() => {
                  setSelectedDate(day.iso);
                  setLockedDate(day.iso);
                  setHoveredDate(day.iso);
                }}
                style={{
                  transform: expanded ? "translateY(-4px) scale(1.03)" : undefined,
                  zIndex: expanded ? 5 : undefined,
                }}
              >
                <span className="day-name">{day.day}</span>
                <span className="day-num">{day.num}</span>
              </button>
            );
          })}
        </div>

        <div className="calendar-selected-header">
          <span>{selectedDate}</span>
          <span>{groupedByDate[selectedDate]?.length || 0} scheduled</span>
        </div>
      </section>

      <section className="achievements-card">
        <div className="achievements-header">
          <h3>Achievements</h3>
          <span className="streak-badge"><Flame size={14} /> {completed ? Math.min(completed, 7) : 0} Day Streak</span>
        </div>
        <div className="achievements-content">
          <div className="progress-ring-container">
            <svg viewBox="0 0 100 100" aria-label={`${completion}% complete`}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e7eb" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="9"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * completion) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="progress-text">{completion}%</span>
          </div>
          <div className="stats-legend">
            <span className="legend-item"><span className="dot blue" />{completed} Completed</span>
            <span className="legend-item"><span className="dot coral" />{active} Ongoing</span>
          </div>
        </div>
      </section>

      <section className="activity-card">
        <div className="achievements-header">
          <h3>Activities</h3>
          <span className="section-caption">Completion rate</span>
        </div>
        <div className="bar-chart">
          {activity.map((day) => {
            const expanded = hoveredBar === day.iso || lockedBar === day.iso;
            return (
              <button
                type="button"
                className={`chart-bar-col ${expanded ? "locked" : ""}`}
                key={day.iso}
                data-activity-date={day.iso}
                onMouseEnter={() => setHoveredBar(day.iso)}
                onMouseLeave={() => lockedBar !== day.iso && setHoveredBar(null)}
                onClick={() => {
                  setLockedBar(day.iso);
                  setHoveredBar(day.iso);
                }}
              >
                <span className="chart-value">{day.rate}%</span>
                <div className="bar-wrapper">
                  <div className={`bar-fill ${day.rate ? "highlight" : ""}`} style={{ height: `${day.rate}%` }} />
                </div>
                <span className="chart-label">{day.initial}</span>
                <span className="chart-value">{day.done}/{day.scheduled}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="tasks-board">
        <div className="tasks-board-header">
          <div>
            <h3>Task Overview</h3>
            <span className="section-caption">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })} • {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="filter-chips">
            {[['all', 'All'], ['active', 'Active'], ['done', 'Done']].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`filter-btn ${filterMode === value ? "active" : ""}`}
                onClick={() => setFilterMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="page-error">{error}</div>}

        <TodoList
          todos={dayTasks}
          loading={loading}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdateTitle={updateTitle}
        />
      </section>

      <BottomNav />

      {showCreate && (
        <div className="modal-overlay" onMouseDown={() => setShowCreate(false)}>
          <section className="modal-content" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="premium-eyebrow">Task creation</span>
                <h3>New task</h3>
              </div>
              <button type="button" className="icon-close-btn" onClick={() => setShowCreate(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={createTask}>
              <div className="form-field">
                <label htmlFor="new-task-title">Task</label>
                <input
                  id="new-task-title"
                  className="modal-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-task-priority">Priority</label>
                <select
                  id="new-task-priority"
                  className="modal-select"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="new-task-date">Due date</label>
                <input
                  id="new-task-date"
                  className="modal-input"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-btn-primary">Add Task</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showProfile && (
        <div className="modal-overlay" onMouseDown={() => setShowProfile(false)}>
          <section className="modal-content profile-popup" onMouseDown={(event) => event.stopPropagation()}>
            <div className="user-avatar-badge large">{initial}</div>
            <div className="profile-name">{userName}</div>
            <div className="profile-email">{email}</div>
            <div className="profile-actions">
              <button type="button" className="modal-btn-primary" onClick={() => navigate("/profile")}>
                <UserRound size={16} /> Open Profile
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default TodoDashboard;
