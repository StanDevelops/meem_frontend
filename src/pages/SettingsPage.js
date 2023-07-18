import ReactDOM from "react-dom";
import React from "react";
import "./SettingsPage.css";
import { Navigate, useNavigate } from "react-router-dom";

export const SettingsPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // 👇️ replace set to true
    navigate("/", { replace: true });
  };
  return (
    <section>
      <h1>Settings page</h1>
      <button onClick={handleGoBack}>Go Back</button>
    </section>
  );
};

export default SettingsPage;
