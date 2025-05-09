const express = require("express");
const mongoose = require("mongoose");
const Reservation = require("../models/reservationModel");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    const saved = await newReservation.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Błąd zapisu:", err);
    res.status(500).json({ message: "Błąd zapisu rezerwacji" });
  }
});

router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    console.error("❌ Błąd pobierania:", err);
    res.status(500).json({ message: "Błąd pobierania danych" });
  }
});

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
      return res
        .status(404)
        .json({ message: "Nie znaleziono rezerwacji do edycji" });
    }

    res.json(updatedReservation);
  } catch (err) {
    console.error("❌ Błąd przy aktualizacji:", err);
    res.status(500).json({ message: "Błąd podczas edycji rezerwacji" });
  }
});

module.exports = router;
