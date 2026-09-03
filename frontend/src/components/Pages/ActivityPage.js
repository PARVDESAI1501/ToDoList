import React, { useEffect, useMemo, useState } from "react";
import BottomNav from "../Dashboard/BottomNav";
import { api } from "../../services/api";

const pad = (value) => String(value).padStart(2, "0");
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const normalizeDate = (value) => (typeof value === "string" ? value.slice(0, 10) : "");

const ActivityPage = ({ user }) => {
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
      if (locked && !event.target.closest(`[data-analytics-date="${locked}"]`)) {
        setLocked(null);
        setHovered(null);
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [locked]);

  const metrics = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const iso = formatDate(date);
      const scheduled = todos.filter((todo) => normalizeDate(todo.dueDate) === iso);
      const done = scheduled.filter((todo) => todo.completed).length;
      return {
        iso,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        scheduled: scheduled.length,
        done,
        rate: scheduled.length ? Math.round((done / scheduled.length) * 100) : 0,
      };
    });
    return {
      total,
      completed,
      active: total - completed,
      completion: total ? Math.round((completed / total) * 100) : 0,
      days,
    };
  }, [todos]);

  const name = user?.name || user?.email?.split("@")[0] || "your account";

  return (
    <main className="standard-page">
      <div className="standard-page-container">
        <section className="premium-page-card">
          <header className="premium-page-header">
            <div>
              <span className="premium-eyebrow">TASKFLOW</span>
              <h1 className="premium-page-title">Activity & Analytics</h1>
              <p className="premium-page-subtitle">Live progress for {name}</p>
            </div>
          </header>

          {loading ? (
            <div className="empty-state">Synchronizing activity…</div>
          ) : (
            <>
              <div className="analytics-summary-grid">
                <article className="analytics-summary-card"><strong>{metrics.total}</strong><span>Total</span></article>
                <article className="analytics-summary-card"><strong>{metrics.completed}</strong><span>Completed</span></article>
                <article className="analytics-summary-card accent-stat"><strong>{metrics.completion}%</strong><span>Completion</span></article>
              </div>

              <section className="analytics-main-card">
                <div className="analytics-card-header">
                  <div>
                    <h2>Last 7 Days</h2>
                    <p>Completed versus scheduled tasks.</p>
                  </div>
                  {locked && <span className="analytics-selection-note">Selected day</span>}
                </div>

                <div className="analytics-chart">
                  {metrics.days.map((day) => {
                    const expanded = hovered === day.iso || locked === day.iso;
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        data-analytics-date={day.iso}
                        className={`analytics-bar-column ${expanded ? 'expanded' : ''}`}
                        onMouseEnter={() => setHovered(day.iso)}
                        onMouseLeave={() => locked !== day.iso && setHovered(null)}
                        onClick={() => {
                          setLocked(day.iso);
                          setHovered(day.iso);
                        }}
                      >
                        <span className="analytics-rate">{day.rate}%</span>
                        <div className="analytics-track">
                          <div className={`analytics-fill ${day.rate ? 'has-progress' : ''}`} style={{ height: `${day.rate}%` }} />
                        </div>
                        <span className="analytics-day">{day.day}</span>
                        <span className="analytics-ratio">{day.done}/{day.scheduled}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="analytics-workload-card">
                <div>
                  <span className="analytics-workload-label">CURRENT WORKLOAD</span>
                  <h2>{metrics.active} ongoing task{metrics.active === 1 ? '' : 's'}</h2>
                  <p>{metrics.completed} completed.</p>
                </div>
                <div className="analytics-workload-number">{metrics.completion}%</div>
              </section>
            </>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
};

export default ActivityPage;
