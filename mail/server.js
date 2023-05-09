const express = require('express');
const cors = require('cors');
const logger = require("morgan");
require('dotenv').config();
const mongoose = require('mongoose');
const scheduledFunctions = require('./service/cornjob');

const app = express();

app.disable('x-powered-by');
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/log', require('./routes/log'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/subs', require('./routes/subs'));
app.use('/api/dashboard', require('./routes/dashboard'));

const port = process.env.PORT || 5465;

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() =>
    app.listen(port, () => {
      console.log(`\n\nmongodb is connected!\nlocal: http://localhost:${port}`);
      scheduledFunctions.initScheduledJobs();
    })
  )
  .catch((err) => console.log(err));
