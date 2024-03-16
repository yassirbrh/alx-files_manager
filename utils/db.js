import { MongoClient, ObjectID } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
    this._db = this.client.db();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async findOne(collectionName, data) {
    const collection = this._db.collection(collectionName);
    return collection.findOne(data);
  }

  async insertOne(collectionName, data) {
    const collection = this._db.collection(collectionName);
    return collection.insertOne(data);
  }

  async listFiles(data) {
    const { userId, page } = data;
    const { parentId } = data;
    let pipeline = [];
    if (parentId === undefined) {
      pipeline = [
        { $match: { userId: ObjectID(userId) } },
        { $facet: { data: [{ $skip: page * 20 }, { $limit: 20 }] } },
      ];
    } else {
      pipeline = [
        { $match: { userId: ObjectID(userId), parentId } },
        { $facet: { data: [{ $skip: page * 20 }, { $limit: 20 }] } },
      ];
    }
    return this._db.collection('files').aggregate(pipeline).toArray();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
