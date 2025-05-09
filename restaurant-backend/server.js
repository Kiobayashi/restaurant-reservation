const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path"); // ✅ dodane
const reservationsRouter = require(path.join(
  __dirname,
  "routes",
  "reservationsRouter"
)); // ✅ ścieżka niezależna od miejsca uruchomienia

const app = express();
const PORT = 5000;
const JWT_SECRET = "supersekretnyklucz"; // możesz przenieść do .env

// Połączenie z MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/restaurant-reservations", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Połączono z MongoDB"))
  .catch((err) => console.error("❌ Błąd połączenia z MongoDB:", err));

app.use(cors());
app.use(express.json());

// 🔐 Trasa logowania
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  if (login === "admin" && password === "admin123") {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
});

// 🔐 Middleware do weryfikacji tokena
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Brak tokena" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Nieprawidłowy token" });
  }
};

// 🔐 Zabezpieczone trasy
app.use(
  "/api/reservations",
  (req, res, next) => {
    if (
      req.method === "GET" ||
      req.method === "DELETE" ||
      req.method === "PUT"
    ) {
      return verifyToken(req, res, next);
    }
    // pozwól na POST bez logowania (formularz rezerwacji)
    next();
  },
  reservationsRouter
);

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
});
