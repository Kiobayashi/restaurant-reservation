const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  guests: Number,
  date: String,
  time: String,
});

module.exports = mongoose.model("Reservation", reservationSchema);
