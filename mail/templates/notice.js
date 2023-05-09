const { COMPANY_NAME, CLIENT_URL, EMAIL_SENDER } = require('../config');

const template = (receiverName, notice) => {
  const subject = `Notice: ${COMPANY_NAME} - ${notice.title}`;
  const body = `Dear ${receiverName},
  
We wanted to inform you that ${COMPANY_NAME} has recently published a new notice titled ${notice.title}.

The notice can be accessed by visiting our website at ${CLIENT_URL} or by clicking on the link below.
${CLIENT_URL}/notice/${notice.url}

Thank you for your attention to this matter.

Sincerely,
${EMAIL_SENDER}`;
  return { subject, body };
};

module.exports = template;
