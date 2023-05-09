const mongoose = require('mongoose');

const s = mongoose.Schema(
  {
    receiver: {
      type: String,
    },
    status: {
      type: String,
    },
    err: {
      type: Object,
    },
    subsCount: { type: Number },
    timestamp: { type: Number },
  },
  { timestamps: true }
);

const Log = mongoose.model('Log', s);

module.exports = { Log };
