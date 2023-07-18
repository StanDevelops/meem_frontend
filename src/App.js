import "./App.css";
import logo from "./assets/img/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import RequireAuth from "./components/RequireAuth";
import ModPage from "./pages/ModPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import jwt_decode from "jwt-decode";
import React from "react";
import { useState } from "react";
import useAuth from "./hooks/useAuth";
import ViewPostPage from "./pages/ViewPostPage";

function App(props) {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route exact path="/post/view/:postUrl" element={<ViewPostPage />} />
      </Route>
      <Route
        element={
          <RequireAuth authorities={["REGULAR", "MOD", "ADMIN", "BANNED"]} />
        }
      >
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route element={<RequireAuth authorities={["MOD", "ADMIN"]} />}>
        <Route path="/moderator" element={<ModPage />} />
      </Route>
      <Route element={<RequireAuth authorities={["ADMIN"]} />}>
        <Route path="/administrator" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
