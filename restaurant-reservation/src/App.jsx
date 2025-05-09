// 📁 src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import AdminPanel from "./AdminPanel";
import RegisterForm from "./RegisterForm";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");

      const isAdmin = email === "admin";
      const url = isAdmin
        ? "http://localhost:5000/api/admin-login"
        : "http://localhost:5000/api/login";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isAdmin ? { login: email, password } : { email, password }
          ),
        });

        const data = await response.json();

        if (!response.ok || !data.token) {
          setError(data.message || "Błąd logowania");
          return;
        }

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        navigate(isAdmin ? "/admin/panel" : "/");
      } catch (err) {
        setError("Błąd połączenia z serwerem");
      }
    };

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white text-black p-8 rounded-xl shadow-xl"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Logowanie</h2>

          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Email (lub "admin")
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Wpisz email lub login admina"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Wpisz hasło"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Zaloguj
          </button>

          <p className="text-sm mt-4 text-center">
            Nie masz konta?{" "}
            <a href="/register" className="text-blue-500 underline">
              Zarejestruj się
            </a>
          </p>
        </form>
      </div>
    );
  };

  return (
    <div>
      {isLoggedIn && (
        <button
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Wyloguj
        </button>
      )}

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <ReservationForm /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/admin/panel"
          element={isLoggedIn ? <AdminPanel /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
