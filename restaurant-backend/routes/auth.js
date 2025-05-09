const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const router = express.Router();

const JWT_SECRET = "supersekretnyklucz"; // Użyj tego samego co w server.js

// Rejestracja
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Użytkownik już istnieje" });
    }
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: "Użytkownik utworzony" });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });

    const token = jwt.sign({ userId: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Błąd logowania" });
  }
});

module.exports = router;
