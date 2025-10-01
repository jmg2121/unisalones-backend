const overlaps = (aStart, aEnd, bStart, bEnd) => {
  return (aStart < bEnd) && (bStart < aEnd);
};

module.exports = { overlaps };
