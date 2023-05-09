const express = require('express');
const router = express.Router();
const { Log } = require('../models/log');

router.get('/', (req, res) => {
  Log.find().exec((err, logs) => {
    if (err) {
      return res.status(500).json({ message: 'Error while getting logs' });
    }
    res.json(logs);
  });
});

router.delete('/all', async (req, res) => {
  await Log.deleteMany({});
  res.json({ message: 'All clear!' });
});

module.exports = router;
