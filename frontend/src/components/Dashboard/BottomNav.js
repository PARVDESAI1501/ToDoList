import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const item = (path, label, Icon) => (
    <button
      type="button"
      className={`dock-nav-item ${location.pathname === path ? "active" : ""}`}
      onClick={() => navigate(path)}
      aria-label={label}
      title={label}
    >
      <span className="dock-icon-wrap">
        <Icon size={19} strokeWidth={1.9} />
      </span>
      <span className="dock-label">{label}</span>
    </button>
  );

  return (
    <nav className="floating-dock-container" aria-label="Primary navigation">
      <div className="floating-dock">
        {item("/dashboard", "Tasks", CheckCircle2)}
        {item("/calendar", "Calendar", CalendarDays)}

        <button
          type="button"
          className="dock-nav-item dock-add"
          onClick={() => navigate("/dashboard?create=1")}
          aria-label="Add task"
          title="Add task"
        >
          <span className="fab-button"><Plus size={23} strokeWidth={2.1} /></span>
          <span className="dock-label">Add Task</span>
        </button>

        {item("/activity", "Activity", Clock3)}
        {item("/profile", "Profile", UserRound)}
      </div>
    </nav>
  );
};

export default BottomNav;
