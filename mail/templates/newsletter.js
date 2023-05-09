const { COMPANY_NAME, CLIENT_URL, EMAIL_SENDER } = require('../config');

const template = (receiverName, newsletter) => {
  const subject = `${COMPANY_NAME} Newsletter 📬 - ${newsletter.title}`;
  const body = `Dear ${receiverName},
  
We are excited to announce that ${COMPANY_NAME} has recently published a new newsletter titled ${newsletter.title}.

To access the newsletter, please visit our website at ${CLIENT_URL} or by clicking on the link below.
${CLIENT_URL}/newsletter/${newsletter.url}

We hope you find this information valuable and informative.

Thank you for your continued support.

Sincerely,
${EMAIL_SENDER}`;
  return { subject, body };
};

module.exports = template;
