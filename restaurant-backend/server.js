const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");

const reservationsRouter = require(path.join(
  __dirname,
  "routes",
  "reservationsRouter"
));
const authRouter = require(path.join(__dirname, "routes", "auth"));

const app = express();
const PORT = 5000;
const JWT_SECRET = "supersekretnyklucz"; // Możesz przenieść do .env

// 🔗 Połączenie z MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/restaurant-reservations", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Połączono z MongoDB"))
  .catch((err) => console.error("❌ Błąd połączenia z MongoDB:", err));

app.use(cors());
app.use(express.json());

// 🔐 Middleware JWT
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

// 👨‍💼 Logowanie admina na sztywno (login/hasło)
app.post("/api/admin-login", (req, res) => {
  const { login, password } = req.body;

  if (login === "admin" && password === "admin123") {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
});

// 👤 Logowanie i rejestracja użytkowników
app.use("/api", authRouter);

// 🔐 Zabezpieczenie dostępu do rezerwacji tylko dla zalogowanych (admin/user)
app.use("/api/reservations", verifyToken, reservationsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
});
