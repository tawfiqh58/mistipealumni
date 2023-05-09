const express = require('express');
const router = express.Router();
const { Subs } = require('../models/subs');

router.get('/', (req, res) => {
  Subs.find().exec((err, payload) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error while getting subscriptions' });
    }
    res.json(payload);
  });
});

router.post('/', (req, res) => {
  if (body.email && body.id) {
    const _ = new Subs(req.body);
    _.save((err, r) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Error while saving subscription' });
      }
      res.json({ message: 'Subs created successfully' });
    });
  } else {
    res.status(400).json({
      message:
        'Can not add this data as subscription. Please double check your data',
    });
  }
});

router.delete('/email/:email', (req, res) => {
  Subs.findOneAndDelete({
    email: req.params.email,
  }).exec((err, doc) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error while deleting subscription' });
    }
    res.json({ message: 'Subs deleted successfully' });
  });
});

router.delete('/all', async (req, res) => {
  await Subs.deleteMany({});
  res.json({ message: 'All clear!' });
});

router.delete('/:id', (req, res) => {
  Subs.findOneAndDelete({
    id: req.params.id,
  }).exec((err, doc) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error while deleting subscription' });
    }
    res.json({ message: 'Subs deleted successfully' });
  });
});

router.get('/:id', (req, res) => {
  Subs.findOne({ id: req.params.id }).exec((err, payload) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error while getting subscription' });
    }
    res.json(payload);
  });
});

module.exports = router;
