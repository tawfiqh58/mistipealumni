const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function isDev() {
  return development;
}
module.exports = { isDev };