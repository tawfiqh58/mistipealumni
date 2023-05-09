const mongoose = require('mongoose');

const sch = mongoose.Schema({
  id: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
});

const Subs = mongoose.model('Subs', sch);

module.exports = { Subs };
