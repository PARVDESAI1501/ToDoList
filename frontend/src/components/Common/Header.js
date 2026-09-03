import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const Header = ({ user, onProfile }) => {
  const navigate = useNavigate();
  const name = user?.name || user?.fullName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const initial = name.charAt(0).toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="app-header glass-header">
      <button
        type="button"
        className="user-profile-chip"
        onClick={onProfile || (() => navigate("/profile"))}
      >
        <span className="user-avatar-badge">{initial}</span>
        <span className="user-text-details">
          <span className="app-title-bold">{name}</span>
          <span className="user-email-subtitle">{email}</span>
        </span>
      </button>

      <button
        type="button"
        className="icon-signout-btn"
        onClick={handleLogout}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={17} />
      </button>
    </header>
  );
};

export default Header;
