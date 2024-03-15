/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */

import { ObjectID } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

async function postUpload(req, res) {
  const token = req.headers['x-token'];

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await dbClient.findOne('users', { _id: ObjectID(userId) });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, type, data } = req.body;
  const { parentId = 0, isPublic = false } = req.body;
  const allowedFormats = ['folder', 'file', 'image'];

  if (!name) {
    res.status(400).json({ error: 'Missing name' });
  }
  if (!type || !allowedFormats.includes(type)) {
    res.status(400).json({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    res.status(400).json({ error: 'Missing data' });
  }
  if (parentId) {
    const parent = await dbClient.findOne('files', { _id: ObjectID(parentId) });
    if (!parent) {
      res.status(400).json({ error: 'Parent not found' });
    }
    if (parent.type !== 'folder') {
      res.status(400).json({ error: 'Parent is not a folder' });
    }
  }
  if (type === 'folder') {
    const file = await dbClient.insertOne('files', {
      userId: ObjectID(userId),
      name,
      type,
      isPublic,
      parentId: String(parentId),
    });
    res.status(201).json({
      id: file.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  } else {
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filename = uuidv4();
    let fileContent;
    if (type === 'image') {
      fileContent = data.replace(/^data:image\/\w+;base64,/, '');
      fileContent = Buffer.from(fileContent, 'base64');
    } else {
      fileContent = Buffer.from(data, 'base64').toString('utf8');
    }
    fs.mkdirSync(`${folderPath}`, { recursive: true });
    const localPath = (folderPath[-1] === '/') ? `${folderPath}${filename}` : `${folderPath}/${filename}`;
    fs.writeFileSync(localPath, fileContent);
    const result = await dbClient.insertOne('files', {
      userId: ObjectID(userId),
      name,
      type,
      parentId: ObjectID(parentId),
      isPublic,
      localPath,
    });
    res.status(201).json({
      id: result.insertedId, userId, name, type, isPublic, parentId,
    });
  }
}

module.exports = { postUpload };
