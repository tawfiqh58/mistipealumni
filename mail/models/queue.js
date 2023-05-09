const mongoose = require('mongoose');

const s = mongoose.Schema({
  data: { type: Object },
  status: { type: String },
  sent: [String],
  timestamp: { type: Number },
});

const Queue = mongoose.model('Queue', s);

module.exports = { Queue };
