import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import AdminPanel from "./AdminPanel";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const LoginPage = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");

      try {
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password }),
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (!response.ok || !data.token) {
          setError(data.message || "Błąd logowania");
          return;
        }

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        navigate("/admin/panel");
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
          <h2 className="text-2xl font-bold text-center mb-6">
            Logowanie administratora
          </h2>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Wpisz login"
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
        </form>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<ReservationForm />} />
      <Route path="/admin" element={<LoginPage />} />
      <Route
        path="/admin/panel"
        element={isLoggedIn ? <AdminPanel /> : <Navigate to="/admin" />}
      />
    </Routes>
  );
}

export default App;
