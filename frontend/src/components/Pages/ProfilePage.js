import React, { useEffect, useState } from "react";
import { LogOut, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../Dashboard/BottomNav";
import { api } from "../../services/api";

const ProfilePage = ({ user: routeUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(routeUser || null);
  const [loading, setLoading] = useState(!routeUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (routeUser) {
      setUser(routeUser);
      setLoading(false);
      return undefined;
    }

    let active = true;
    api.get("/api/auth/me")
      .then((response) => {
        if (active) setUser(response?.user || null);
      })
      .catch((err) => {
        if (active) setError(err?.data?.message || "Unable to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [routeUser]);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <main className="standard-page">
        <div className="standard-page-container">
          <section className="profile-card"><div className="empty-state">Loading profile…</div></section>
        </div>
        <BottomNav />
      </main>
    );
  }

  const name = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const initial = name.charAt(0).toUpperCase() || "U";

  return (
    <main className="standard-page">
      <div className="profile-page-shell">
        <section className="profile-card">
          <span className="profile-kicker">TaskFlow Account</span>
          <div className="profile-avatar">{initial}</div>
          <h1 className="profile-name">{name}</h1>
          <p className="profile-email">{email}</p>

          {error && <div className="page-error">{error}</div>}

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Name</span>
              <span className="profile-info-value"><UserRound size={15} />{name}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value"><Mail size={15} />{email}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="profile-logout-btn" onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
};

export default ProfilePage;
