const nodemailer = require('nodemailer');
const axios = require('axios');
const CronJob = require('node-cron');

const { Queue } = require('../models/queue');
const { Log } = require('../models/log');
const { SERVER_URL } = require('../config');
const { textEmail } = require('../templates/template-handler');

var JOB_RUNNIGN = false;
const FROM_COMPANY = `"MIST-IPE Alumni" ${process.env.EMAIL_SENDER}`;
const QUOTA = 500;

// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_TRANSPORTER,
//   auth: {
//     user: process.env.EMAIL_ACCOUNT,
//     pass: process.env.GMAIL_CUSTOM_APP_PASSWORD,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.NAMECHEAP_TRANSPORTER,
  port: 465,
  secure: true,
  auth: {
    user: process.env.NAMECHEAP_EMAIL,
    pass: process.env.NAMECHEAP_EMAIL_PASSWORD,
  },
});

const collectQueue = async () => {
  try {
    const doc = await Queue.findOne({});
    return doc;
  } catch (err) {
    JOB_RUNNIGN = false;
    console.log(err);
    return null;
  }
};

const lastHrLogs = async (lastHour) => {
  try {
    // # Collect last hr send logs
    const docLength = await Log.countDocuments({
      timestamp: { $gt: lastHour },
    });
    return docLength;
  } catch (err) {
    JOB_RUNNIGN = false;
    console.log(err);
    return QUOTA;
  }
};

const fetchEmail = async () => {
  const subscribers = [];
  let users;
  let admin;

  try {
    // # Fetch user
    const res = await axios.get(`${SERVER_URL}/api/user`);
    const resAdmin = await axios.get(`${SERVER_URL}/api/admin`);
    users = res.data?.payload;
    admin = resAdmin.data;
  } catch (err) {
    console.log(err);
  }

  // # Collect subscription email
  if (users && users.length > 0) {
    users.forEach((val, i) => {
      if (val.subscription && val.subscription.length > 0) {
        val.subscription.map((email) => {
          subscribers.push({ email, name: val.name });
        });
      }
    });
  }
  // # Collect admin email
  if (admin && admin.length > 0) {
    admin.forEach((val, i) => {
      subscribers.push({ email: val.email, name: val.name });
    });
  }

  return subscribers;
};

const hasEmail = (count) => {
  console.log('subscription email:', count);
  // # Check subscriber count
  // stop the job
  if (count == 0) {
    JOB_RUNNIGN = false;
    console.log('subscriber: 0');
    console.log('Job stopped!');
    return false;
  }
  return true;
};

const hasQueue = (queue) => {
  if (!queue) {
    // Queue empty : stop the job
    JOB_RUNNIGN = false;
    console.log('queue: 0');
    console.log('Job stopped!');
    return false;
  }

  console.log('queue:', 'available');
  return true;
};

const filterNotSendEmail = (sentEmails, allEmail) => {
  const list = [];
  for (let i = 0; i < allEmail.length; i++) {
    // # filter not send emails
    if (!sentEmails.includes(allEmail[i].email)) list.push(allEmail[i]);
  }
  return list;
};

const removeQueue = (queueId) => {
  Queue.findOneAndDelete({
    _id: queueId,
  }).exec((err, doc) => {
    if (err) {
      return console.log(err);
    }
    console.log('so queue removed!\n');

    // # Restart
    // restart job again to serve next queue
    messageQueue();
  });
};

const isAllSent = (notSendCount) => {
  // # Remove the queue
  // if all subscriber received this queue
  if (notSendCount == 0) {
    JOB_RUNNIGN = false;
    console.log('but everyone received this queue.');
    return true;
  }
  return false;
};

// We store subs count to show better analysis
const saveLog = async (log, subsCount) => {
  try {
    const _ = new Log({ ...log, subsCount });
    await _.save();
  } catch (err) {
    console.log(err);
  }
};

const sendEmail = async (email, data) => {
  const emailTemp = textEmail(data);
  // # Email content
  const mailContent = {
    from: FROM_COMPANY,
    to: email,
    subject: emailTemp.subject,
    text: emailTemp.body,
  };

  try {
    // # Send email!
    console.log('receiver', email);
    const result = await transporter.sendMail(mailContent);
    console.log('info', result);

    // log
    return {
      receiver: email,
      status: 'suceess',
      timestamp: Date.now(),
    };
  } catch (err) {
    console.log('sendMail', err);

    return {
      receiver: email,
      status: 'failed',
      timestamp: Date.now(),
      err,
    };
  }
};

const updateQueue = async (queueId, data) => {
  try {
    await Queue.findOneAndUpdate({ _id: queueId }, data);
  } catch (err) {
    throw err;
  }
};

async function messageQueue() {
  JOB_RUNNIGN = true;

  try {
    const subscribers = await fetchEmail();
    const subsCount = subscribers.length;
    if (!hasEmail(subsCount)) return;

    const queue = await collectQueue();
    if (!hasQueue(queue)) return;

    const queueId = queue._id;

    const prevSentEmails = queue.sent ? queue.sent : [];

    const notSendEmails = filterNotSendEmail(prevSentEmails, subscribers);

    if (isAllSent(notSendEmails.length)) {
      return removeQueue(queueId);
    }

    const now = Date.now();
    const ONE_HOUR = 1000 * 3600;

    const filledQuota = await lastHrLogs(now - ONE_HOUR);

    // # Quota test and send email
    // # Calculate email sent within an hour
    const quota = 500 - filledQuota; // 500 - last sent cout = now
    const loopCount =
      notSendEmails.length < quota ? notSendEmails.length : quota;

    console.log('quota:', quota);
    console.log('receiver:', loopCount);

    // Sent email
    const newlySent = [];
    for (let i = 0; i < loopCount; i++) {
      const _email = notSendEmails[i].email;
      let data = {};
      if ('notice') {
        // receiverName
        // notice obj
        data.receiverName = notSendEmails[i].name;
        data.type = 'notice';
        data.notice = queue.data;
      } else if ('newsletter') {
        // receiverName
        // newsletter obj
        data.receiverName = notSendEmails[i].name;
        data.type = 'newsletter';
        data.newsletter = queue.data;
      } else {
        continue;
      }
      // We are not considering any failure issue
      const log = await sendEmail(_email, data);

      // Add log
      await saveLog(log, subsCount);

      // Remove email from queue
      newlySent.push(_email);
    }

    // Concat with previously sent emails
    const prevSent = queue.sent ? queue.sent : [];
    const allSentEmails = prevSent.concat(newlySent);

    const _updateQueue = {
      data: queue.data,
      timestamp: Date.now(),
      status: 'inprogress',
      sent: allSentEmails,
    };

    await updateQueue(queueId, _updateQueue);
    // Not handled if queue failed to update
    // that's means email may send twice

    JOB_RUNNIGN = false;
    console.log('Job finished!');
  } catch (err) {
    JOB_RUNNIGN = false;
    console.log(err?.message);
    console.log('Job stopped!');
  }
  console.log('\n---------------\n');
}

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('* * * * *', () => {
    // Set timer to send rest or setup a corn job the will check queue after each 1 min
    console.log('Job started!');

    // # Start Job
    if (!JOB_RUNNIGN) {
      messageQueue();
    }
  });
  scheduledJobFunction.start();
};
