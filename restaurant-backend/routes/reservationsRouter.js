const express = require("express");
const mongoose = require("mongoose");
const Reservation = require("../models/reservationModel");

const router = express.Router();

// 🔒 Dodawanie nowej rezerwacji (z userId i blokadą duplikatów)
router.post("/", async (req, res) => {
  try {
    const { date, time } = req.body;
    const userId = req.user.userId;

    const exists = await Reservation.findOne({ date, time, userId });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Masz już rezerwację na ten termin." });
    }

    const newReservation = new Reservation({ ...req.body, userId });
    const saved = await newReservation.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Błąd zapisu:", err);
    res.status(500).json({ message: "Błąd zapisu rezerwacji" });
  }
});

// 🔍 Pobieranie wszystkich rezerwacji (np. dla admina)
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    console.error("❌ Błąd pobierania:", err);
    res.status(500).json({ message: "Błąd pobierania danych" });
  }
});

// 🗑 Usuwanie rezerwacji
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Reservation.findByIdAndDelete(
      new mongoose.Types.ObjectId(id)
    );
    if (!result) {
      return res.status(404).json({ message: "Nie znaleziono rezerwacji" });
    }
    res.json({ message: "Usunięto rezerwację" });
  } catch (err) {
    console.error("❌ Błąd przy usuwaniu:", err);
    res.status(500).json({ message: "Błąd serwera przy usuwaniu" });
  }
});

// ✏️ Aktualizacja rezerwacji
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Nie znaleziono rezerwacji" });
    }

    res.json(updatedReservation);
  } catch (err) {
    console.error("❌ Błąd przy aktualizacji:", err);
    res.status(500).json({ message: "Błąd serwera przy aktualizacji" });
  }
});

module.exports = router;
