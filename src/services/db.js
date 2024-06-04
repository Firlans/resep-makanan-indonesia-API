const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore({
  projectId: process.env.ID_PROJECT,
  keyFilename: process.env.SERVICE_ACCOUNT
});

module.exports = firestore;