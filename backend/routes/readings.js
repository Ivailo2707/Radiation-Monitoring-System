const express = require('express');
const Reading = require('../models/Reading');
const { checkRadiationLevel } = require('../utils/alarmChecker');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const reading = new Reading(req.body);
  await reading.save();
  const alarm = checkRadiationLevel(reading.value);
  res.json({ alarm });
});

router.get('/', auth, async (req, res) => {
  const readings = await Reading.find().sort({ timestamp: -1 }).limit(100);
  res.json(readings);
});

module.exports = router;
