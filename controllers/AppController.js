import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(req, res) {
  res.status(200).json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
}

async function getStats(req, res) {
  res.status(200).json({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
}

module.exports = { getStatus, getStats };
