import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "../Dashboard/BottomNav";
import { api } from "../../services/api";

const pad = (value) => String(value).padStart(2, "0");
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const normalizeDate = (value) => (typeof value === "string" ? value.slice(0, 10) : "");

const CalendarPage = ({ user }) => {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [locked, setLocked] = useState(null);

  const load = async () => {
    try {
      const response = await api.get("/api/todos");
      setTodos(Array.isArray(response?.todos) ? response.todos : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 4000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const outside = (event) => {
      if (locked && !event.target.closest(`[data-calendar-date="${locked}"]`)) {
        setLocked(null);
        setHovered(null);
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [locked]);

  const dataByDate = useMemo(() => {
    const result = {};
    todos.forEach((todo) => {
      const date = normalizeDate(todo.dueDate);
      if (!date) return;
      if (!result[date]) result[date] = [];
      result[date].push(todo);
    });
    return result;
  }, [todos]);

  const calendarCells = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const days = new Date(year, monthIndex + 1, 0).getDate();
    const cells = Array.from({ length: firstDay }, () => null);
    for (let day = 1; day <= days; day += 1) cells.push(new Date(year, monthIndex, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  const today = formatDate(new Date());
  const selectedTasks = dataByDate[selectedDate] || [];
  const name = user?.name || user?.email?.split("@")[0] || "your account";

  return (
    <main className="standard-page">
      <div className="standard-page-container">
        <section className="calendar-page-card">
          <header className="premium-page-header">
            <div>
              <span className="premium-eyebrow">TASKFLOW</span>
              <h1 className="premium-page-title">Calendar</h1>
              <p className="premium-page-subtitle">Live schedule for {name}</p>
            </div>
            <button
              type="button"
              className="today-button"
              onClick={() => {
                const now = new Date();
                setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDate(formatDate(now));
              }}
            >Today</button>
          </header>

          <div className="calendar-month-toolbar">
            <button type="button" className="calendar-round-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft size={18} />
            </button>
            <h2>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
            <button type="button" className="calendar-round-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-grid-shell">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div className="calendar-weekday" key={day}>{day}</div>
            ))}

            {calendarCells.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="calendar-day empty" />;
              const iso = formatDate(date);
              const count = dataByDate[iso]?.length || 0;
              const expanded = hovered === iso || locked === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  data-calendar-date={iso}
                  className={`calendar-day ${selectedDate === iso ? 'selected' : ''} ${today === iso ? 'today' : ''}`}
                  onMouseEnter={() => setHovered(iso)}
                  onMouseLeave={() => locked !== iso && setHovered(null)}
                  onClick={() => {
                    setSelectedDate(iso);
                    setLocked(iso);
                    setHovered(iso);
                  }}
                  style={{
                    transform: expanded ? 'translateY(-4px) scale(1.025)' : undefined,
                    zIndex: expanded ? 10 : undefined,
                  }}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>
                  <span className={`calendar-day-count ${count ? 'has-tasks' : ''}`}>
                    {count ? `${count} task${count === 1 ? '' : 's'}` : 'No tasks'}
                  </span>
                </button>
              );
            })}
          </div>

          <section className="selected-date-card">
            <div className="selected-date-header">
              <div>
                <span className="premium-eyebrow">Selected date</span>
                <h2>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              </div>
              <span className="selected-task-count">{selectedTasks.length} scheduled</span>
            </div>

            {loading ? (
              <div className="empty-state">Synchronizing…</div>
            ) : selectedTasks.length === 0 ? (
              <div className="empty-state">No tasks scheduled for this date.</div>
            ) : (
              <div className="selected-task-list">
                {selectedTasks.map((todo) => (
                  <article className="calendar-task-row" key={todo.id}>
                    <span className={`calendar-task-check ${todo.completed ? 'completed' : ''}`}>
                      {todo.completed ? '✓' : ''}
                    </span>
                    <div className="calendar-task-content">
                      <span className={`calendar-priority ${todo.priority || 'medium'}`}>{todo.priority || 'medium'}</span>
                      <strong className={todo.completed ? 'completed-text' : ''}>{todo.title}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
      <BottomNav />
    </main>
  );
};

export default CalendarPage;
