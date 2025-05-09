const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  guests: Number,
  date: String,
  time: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // powiązanie z użytkownikiem
});

module.exports = mongoose.model("Reservation", reservationSchema);
