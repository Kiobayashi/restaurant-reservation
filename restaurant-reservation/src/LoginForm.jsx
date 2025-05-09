import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPanel from "./AdminPanel";
import ReservationForm from "./ReservationForm";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const LoginPage = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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

        if (!response.ok) {
          setError(data.message || "Błąd logowania");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      } catch (err) {
        setError("Błąd połączenia z serwerem");
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl"
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
              placeholder="admin"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="1234"
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
    <Router>
      <Routes>
        <Route path="/" element={<ReservationForm />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route
          path="/admin/panel"
          element={isLoggedIn ? <AdminPanel /> : <Navigate to="/admin" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
