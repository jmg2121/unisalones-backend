// src/utils/availability.js
function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

module.exports = { overlaps };
