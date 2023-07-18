import { useLocation, Navigate, Outlet } from "react-router-dom";
// import useAuth from "../hooks/useAuth";
import React from "react";
import jwt_decode from "jwt-decode";

const RequireAuth = ({ authorities }) => {
  var authority = "";
  const location = useLocation();

  if (localStorage.getItem("loginState") === "true") {
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwt_decode(accessToken);

    authority = decodedToken["authority"];
  }
  return authorities.includes(authority) ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
