const { Firestore } = require('@google-cloud/firestore');
require('dotenv').config();

// create new client
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

module.exports = firestore;
