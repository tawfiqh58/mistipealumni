const getShortBody = (str) => {
  if (!str) return '';
  return str.length > 80 ? str.substring(0, 60) + '...' : str;
};

module.exports = { getShortBody };
