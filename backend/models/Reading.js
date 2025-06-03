const mongoose = require('mongoose');
const ReadingSchema = new mongoose.Schema({
  value: Number,
  unit: { type: String, default: 'μSv/h' },
  timestamp: { type: Date, default: Date.now },
  location: String,
  sensorId: String
});
module.exports = mongoose.model('Reading', ReadingSchema);