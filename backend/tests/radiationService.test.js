const { checkRadiationLevel } = require('../utils/alarmChecker');

test('should trigger alarm when threshold exceeded', () => {
  expect(checkRadiationLevel(1)).toBe(true);
});

test('should not trigger alarm when below threshold', () => {
  expect(checkRadiationLevel(0.3)).toBe(false);
});
