const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bodyparser = require('body-parser');
const cors = require('cors');

dotenv.config();

const url = process.env.MONGO_URI;
const dbName = 'passop';
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(cors());

async function startServer() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = client.db(dbName);
    const collection = db.collection('passwords');

    // ✅ Get all passwords
    app.get('/', async (req, res) => {
      try {
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch passwords' });
      }
    });

    // ✅ Save a password (just insert, don’t delete or replace)
    app.post('/', async (req, res) => {
      try {
        const password = req.body;
        const result = await collection.insertOne(password);
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to save password' });
      }
    });

    // ✅ Delete a password by id
    app.delete('/', async (req, res) => {
      try {
        const { id } = req.body;
        const result = await collection.deleteOne({ id });
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to delete password' });
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

startServer();
