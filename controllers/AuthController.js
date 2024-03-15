/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */

import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const crypto = require('crypto');

async function getConnect(req, res) {
  const authorizationHeader = req.headers.authorization;
  const data = atob(authorizationHeader.split(' ')[1]); // eslint-disable-line no-undef

  try {
    const userExists = await dbClient.findOne('users', { email: data.split(':')[0] });
    const pwdBuffer = new TextEncoder().encode(data.split(':')[1]);
    const hashPwd = crypto.createHash('sha1').update(pwdBuffer).digest('hex'); // eslint-disable-line no-unused-vars
    if (!userExists || userExists.password !== hashPwd) {
      throw new Error('Unauthorized');
    }
    const token = uuidv4();
    const authKey = `auth_${token}`;
    await redisClient.set(authKey, userExists._id, 24 * 60 * 60);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

async function getDisconnect(req, res) {
  const token = req.headers['x-token'];

  try {
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      throw new Error('Unauthorized');
    }
    const user = await dbClient.findOne('users', { _id: ObjectID(userId) });
    if (!user) {
      throw new Error('Unauthorized');
    }
    await redisClient.del(`auth_${token}`);
    res.status(204).json();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = { getConnect, getDisconnect };
