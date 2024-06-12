const { Firestore } = require('@google-cloud/firestore');
require('dotenv').config();

// create new client
const firestore = new Firestore({
  projectId: process.env.ID_PROJECT,
  keyFilename: process.env.SERVICE_ACCOUNT,
});

module.exports = firestore;
