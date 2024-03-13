#!/usr/bin/node

import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

const crypto = require('crypto');

async function getConnect(req, res) {
	const authorizationHeader = req.headers['authorization'];
	const data = atob(authorizationHeader.split(' ')[1]);

	try {
		const userExists = await dbClient.findOne('users', 'email', data.split(':')[0]);
		const pwdBuffer = new TextEncoder().encode(data.split(':')[1]);
  		const hashPwd = crypto.createHash('sha1').update(pwdBuffer).digest('hex'); // eslint-disable-line no-unused-vars
    	if (!userExists || userExists.password !== hashPwd) {
      		throw new Error('Unauthorized');
    	}
    	const token = uuidv4();
    	const auth_key = `auth_${token}`;
    	await redisClient.set(auth_key, userExists._id, 24*60*60);
    	res.status(200).json({token});
	} catch (error) {
    	res.status(401).json({ error: error.message });
  	}
}

async function getDisconnect(req, res) {

}

module.exports = { getConnect };
