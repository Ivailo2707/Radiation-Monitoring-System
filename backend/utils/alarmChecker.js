const threshold = 0.5; // μSv/h
function checkRadiationLevel(value) {
  return value > threshold;
}
module.exports = { checkRadiationLevel };
