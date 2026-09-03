import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api";

const PublicRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    api.get("/api/auth/me")
      .then((data) => {
        if (active) setStatus(data?.user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (active) setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <div className="route-loading">Loading TaskFlow…</div>;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
