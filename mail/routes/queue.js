const express = require('express');
const router = express.Router();
const axios = require('axios');

const { Queue } = require('../models/queue');
const { CDN_URL, CLIENT_URL, SERVER_URL } = require('../config');

router.get('/', (req, res) => {
  Queue.find().exec((err, queues) => {
    if (err) {
      return res.status(500).json({ message: 'Error while getting queues' });
    }
    res.json(queues);
  });
});

router.post('/', async (req, res) => {
  if (req.body.type !== 'notice' && req.body.type !== 'newsletter') {
    return res.status(400).json({
      message: 'We can only handle notice and newsletter',
    });
  }
  let _data = {};
  if (req.body.type == 'notice') {
    // Required fields!
    // url:
    // type:'notice'

    _data = {
      type: 'notice',
      subject: 'MIST IPE Alumni Notice!',
      body: 'MIST IPE alumni has posted a new notice. Click below link to download the notice',
      actions: [
        {
          name: 'Download',
          url: CDN_URL + '/' + req.body.url,
        },
      ],
    };
  } else if (req.body.type == 'newsletter') {
    // Required fields!
    // mistId:
    // url:
    // type: 'newsletter'
    // title:
    // desc:
    // image:

    // default data
    let author = {
      name: 'Author',
      mistId: 'MIST-ID',
      image: 'image',
      bio: "Author's bio",
    };
    try {
      const userRes = await axios.get(
        `${SERVER_URL}/api/user/${req.body.mistId}`
      );
      const user = userRes.data.payload;
      author = {
        name: user.name,
        mistId: user.mistId,
        image: user.image,
        bio: user.bio,
      };
    } catch (e) {}

    _data = {
      author,
      type: 'newsletter',
      subject: author.name + ' posted a new newsletter',
      title: req.body.title,
      image: CDN_URL + '/' + req.body.image,
      body: req.body.desc,
      actions: [
        {
          name: 'Read Now',
          url: CLIENT_URL + '/newsletter/' + req.body.url,
        },
      ],
    };
  } else {
    return res.status(400).json({ message: 'Can not handle this type' });
  }

  const _newQ = {
    data: _data,
    status: 'inqueue',
    timestamp: Date.now(),
    sent: [],
  };
  const _ = new Queue(_newQ);
  _.save((err, doc) => {
    if (err) {
      return res.status(500).json({ message: 'Error while saving queue' });
    }
    res.json({ message: 'Queue created successfully' });
  });
});

router.delete('/all', async (req, res) => {
  await Queue.deleteMany({});
  res.json({ message: 'All clear!' });
});

module.exports = router;
