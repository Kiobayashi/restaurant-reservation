import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Rejestracja zakończona sukcesem!");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Błąd rejestracji");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-white text-black p-8 rounded-xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Rejestracja użytkownika
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Wpisz email"
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
          Zarejestruj
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
