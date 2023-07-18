import ReactDOM from "react-dom";
import React from "react";
import "./ModPage.css";
import { Navigate } from "react-router-dom";

export const ModPage = () => {
  const goBack = () => Navigate(-1);
  return (
    <section>
      <h1>Moderator page</h1>;<button onClick={goBack}>Go Back</button>;
    </section>
  );
};

export default ModPage;
