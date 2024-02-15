const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  creator: { type: String, required: true },
  participants: [String],
  city: String,
  country: String,
  continent: String,
  startDate: Date,
  endDate: Date,
  nights: Number,
  maxParticipants: Number,
  gallery: [String],
});


const Trip = mongoose.model('Trips', tripSchema);

module.exports = Trip;