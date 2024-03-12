#!/usr/bin/node

import dbClient from '../utils/db';

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

    const userExists = await dbClient.findOne('users', 'email', email);
    if (userExists) {
      throw new Error('Already exist');
    }

    const pwdBuffer = new TextEncoder().encode(password);
    const hashPwd = crypto.createHash('sha1').update(pwdBuffer).digest('hex');

    const user = await dbClient.insertOne('users', { email, password: hashPwd });

    res.status(201).json({ id: user.insertedId, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { postNew };
