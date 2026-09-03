import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [state, setState] = useState({ status: "checking", user: null });

  useEffect(() => {
    let active = true;

    api.get("/api/auth/me")
      .then((data) => {
        if (!active) return;
        setState({
          status: data?.user ? "authenticated" : "unauthenticated",
          user: data?.user || null,
        });
      })
      .catch(() => {
        if (active) setState({ status: "unauthenticated", user: null });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "checking") {
    return <div className="route-loading">Loading TaskFlow…</div>;
  }

  if (state.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return React.isValidElement(children)
    ? React.cloneElement(children, { user: state.user })
    : children;
};

export default ProtectedRoute;
