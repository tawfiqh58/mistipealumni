const express = require('express');
const router = express.Router();
const { Log } = require('../models/log');

const ONE_HOUR = 3600000;

const getFromMongoToday = () => {
  return new Promise(async (resolve, reject) => {
    const _timestamp = Date.now();
    const hr1 = _timestamp - ONE_HOUR;
    const hr2 = _timestamp - 2 * ONE_HOUR;
    const hr3 = _timestamp - 3 * ONE_HOUR;
    const hr4 = _timestamp - 4 * ONE_HOUR;
    const hr5 = _timestamp - 5 * ONE_HOUR;
    const hr6 = _timestamp - 6 * ONE_HOUR;

    try {
      const userActiveStatus = await Log.aggregate([
        {
          $project: {
            hr1: {
              $sum: {
                $cond: [{ $gt: ['$timestamp', hr1] }, 1, 0],
              },
            },
            hr2: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$timestamp', hr2] },
                      { $lt: ['$timestamp', hr1] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            hr3: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$timestamp', hr3] },
                      { $lt: ['$timestamp', hr2] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            hr4: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$timestamp', hr4] },
                      { $lt: ['$timestamp', hr3] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            hr5: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$timestamp', hr5] },
                      { $lt: ['$timestamp', hr4] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            hr6: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$timestamp', hr6] },
                      { $lt: ['$timestamp', hr5] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            hr1: { $sum: '$hr1' },
            hr2: { $sum: '$hr2' },
            hr3: { $sum: '$hr3' },
            hr4: { $sum: '$hr4' },
            hr5: { $sum: '$hr5' },
            hr6: { $sum: '$hr6' },
          },
        },
      ]);

      let total = 0;
      let datasets = [];

      if (userActiveStatus[0]) {
        const data = userActiveStatus[0];
        delete data._id;

        // TODO: integrate it with aggregation pipeline
        for (const key in data) {
          datasets.push(data[key]);
          total += data[key];
        }
      } else {
        datasets = [0, 0, 0, 0, 0, 0];
      }

      datasets.reverse();

      resolve({
        notif: { datasets, total: total },
        subs: { datasets, total: total },
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const getFromMongoDB = () => {
  return new Promise(async (resolve, reject) => {
    let now = new Date();
    let oneDayTs = new Date();
    let lastWeekTs = new Date();
    let lastMonthTs = new Date();

    oneDayTs.setDate(now.getDate() - 1);
    lastWeekTs.setDate(now.getDate() - 7);
    lastMonthTs.setMonth(now.getMonth() - 1);

    oneDayTs = oneDayTs.getTime();
    lastWeekTs = lastWeekTs.getTime();
    lastMonthTs = lastMonthTs.getTime();

    try {
      // get top 10 countris by user count
      const topCountriesByUser = await User.aggregate([
        { $sortByCount: '$country' },
        { $limit: TOP_10_CONTRIES },
      ]);

      // get device counts
      const devicesCount = await User.aggregate([{ $sortByCount: '$device' }]);

      // get gender counts
      const genderCount = await User.aggregate([{ $sortByCount: '$gender' }]);

      // get top 15 user by usage time
      const topActiveUsers = await User.aggregate([
        { $sort: { totalActive: -1 } },
        { $limit: TOP_15_USER },
      ]);

      // get DAU/WAU/MAU
      const userActiveStatus = await User.aggregate([
        {
          $project: {
            lastWeek: {
              $cond: [{ $gt: ['$lastActive', lastWeekTs] }, 1, 0],
            },
            lastMonth: {
              $sum: {
                $cond: [{ $gt: ['$lastActive', lastMonthTs] }, 1, 0],
              },
            },
            lastDay: {
              $sum: {
                $cond: [{ $gt: ['$lastActive', oneDayTs] }, 1, 0],
              },
            },
            all: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            weekly: { $sum: '$lastWeek' },
            monthly: { $sum: '$lastMonth' },
            daily: { $sum: '$lastDay' },
            total: { $sum: '$all' },
          },
        },
      ]);

      const dashboardData = {
        topCountriesByUser,
        devicesCount,
        genderCount,
        topActiveUsers,
        userActiveStatus: userActiveStatus[0],
      };

      resolve(dashboardData);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

router.get('/', (req, res) => {
  getFromMongoToday()
    .then((payload) => res.json(payload))
    .catch((_) =>
      res.status(500).json({ message: 'Error while getting dashboard data' })
    );
});

module.exports = router;
