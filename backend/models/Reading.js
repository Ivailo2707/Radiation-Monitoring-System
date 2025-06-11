const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  value: { type: Number, required: true }, // µSv/h
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', readingSchema);
