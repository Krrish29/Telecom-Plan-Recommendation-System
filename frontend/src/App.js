import React, {
  useState
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./components/Login";

import UserDashboard from "./components/UserDashboard";

import AdminDashboard from "./components/AdminDashboard";

import PlanManagement from "./components/PlanManagement";

import UsersManagement from "./components/UsersManagement";

import {
  getRole,
  getToken
} from "./services/api";

function App() {

  const [role, setRole] =
    useState(getRole());

  const [token, setToken] =
    useState(getToken());

  // LOGIN
  const handleLogin = (
    userRole
  ) => {

    setRole(userRole);

    setToken(getToken());
  };

  // LOGOUT
  const handleLogout = () => {

    localStorage.clear();

    setRole(null);

    setToken(null);
  };

  // NOT LOGGED IN
  if (!token) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  return (

    <BrowserRouter>

      <Routes>

        {/* ADMIN ROUTES */}
        {role === "ADMIN" && (

          <>

            <Route
              path="/dashboard"

              element={
                <AdminDashboard
                  onLogout={
                    handleLogout
                  }
                />
              }
            />

            <Route
              path="/plans"

              element={
                <PlanManagement
                  onLogout={
                    handleLogout
                  }
                />
              }
            />

            <Route
              path="/users"

              element={
                <UsersManagement
                  onLogout={
                    handleLogout
                  }
                />
              }
            />

            <Route
              path="*"

              element={
                <Navigate
                  to="/dashboard"
                />
              }
            />

          </>
        )}

        {/* USER ROUTE */}
        {role !== "ADMIN" && (

          <Route
            path="*"

            element={
              <UserDashboard
                onLogout={
                  handleLogout
                }
              />
            }
          />

        )}

      </Routes>

    </BrowserRouter>
  );
}

export default App;