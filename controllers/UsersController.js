/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */

import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Queue from 'bull';

const crypto = require('crypto');

async function postNew(req, res) {
  const { email, password } = req.body;
  const pwdBuffer = new TextEncoder().encode(password);
  const hashPwd = crypto.createHash('sha1').update(pwdBuffer).digest('hex'); // eslint-disable-line no-unused-vars

  try {
    if (email === undefined) {
      throw new Error('Missing email');
    }

    if (password === undefined) {
      throw new Error('Missing password');
    }

    const userExists = await dbClient.findOne('users', { email });
    if (userExists) {
      throw new Error('Already exist');
    }

    const pwdBuffer = new TextEncoder().encode(password);
    const hashPwd = crypto.createHash('sha1').update(pwdBuffer).digest('hex');

    const user = await dbClient.insertOne('users', { email, password: hashPwd });

    const userQueue = new Queue('userQueue');
    userQueue.on('global:completed', (jobId, result) => { 
      console.log(`Job ${jobId} completed!`);
      userQueue.getJob(jobId).then((job) => {
        console.log(`'Welcome email' has been sent to the user ${job.data.userId} !!`);
        job.remove();
      });
    });
    userQueue.add({ userId: user.insertedId });
    res.status(201).json({ id: user.insertedId, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getMe(req, res) {
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
    res.status(201).json({ id: userId, email: user.email });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = { postNew, getMe };
