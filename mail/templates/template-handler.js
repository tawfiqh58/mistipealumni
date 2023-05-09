const newsletterEmail = require('./newsletter');
const noticeEmail = require('./notice');

const textEmail = (data) => {
  if (data.type == 'notice') {
    return noticeEmail(data.receiverName, data.notice);
  } else if (data.type == 'newsletter') {
    return newsletterEmail(data.receiverName, data.newsletter);
  } else
    return {
      subject: 'Ignore',
      body: 'This is an automated email which was sent by mistake. This should be reported to the administrator.',
    };
};

module.exports = { textEmail };
