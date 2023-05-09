const { isDev } = require('./stage');

const WEBSITE_NAME = 'mistipe.com';
const COMPANY_NAME = 'MIST IPE Alumni';
const DEVELOPER_COMPANY = 'TheDeveloperX';
const EMAIL_SENDER = 'MIST IPE Alumni';

const CDN_URL = isDev()
  ? 'http://localhost:5101'
  : 'https://alumni-cdn.mistipe.com';
const CLIENT_URL = isDev()
  ? 'http://localhost:3000'
  : 'https://alumni.mistipe.com';
const SERVER_URL = isDev()
  ? 'http://localhost:5002'
  : 'https://alumni-server.mistipe.com';

module.exports = {
  CDN_URL,
  CLIENT_URL,
  WEBSITE_NAME,
  SERVER_URL,
  COMPANY_NAME,
  DEVELOPER_COMPANY,
  EMAIL_SENDER,
};
