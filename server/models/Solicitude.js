const mongoose = require('mongoose');

const solicitudeSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  senderUser: { type: String, required: true },
  recipientUser: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Solicitude = mongoose.model('Solicitude', solicitudeSchema);

module.exports = Solicitude;