import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { LoginProvider, LoginContext } from "./context/LoginProvider";
import { ActiveSortingGroupProvider } from "./context/ActiveSortinGroupProvider";
import { ActiveCategoryProvider } from "./context/ActiveCategoryProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
// app.use(express.static(__dirname));

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ActiveSortingGroupProvider>
        <ActiveCategoryProvider>
          <LoginProvider>
            {/* <AuthProvider> */}
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
            {/* </AuthProvider> */}
          </LoginProvider>
        </ActiveCategoryProvider>
      </ActiveSortingGroupProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
