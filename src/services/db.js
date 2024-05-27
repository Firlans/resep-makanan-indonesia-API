const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore({
  projectId: 'my-project-1-416523',
  keyFilename: "my-project-1-416523-c7d437834c9c.json",
});

module.exports = firestore;