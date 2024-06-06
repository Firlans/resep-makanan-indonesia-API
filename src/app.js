"use strict";

const express = require("express");
const bodyParser = require('body-parser');
const routes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

const multer = require('multer');
const upload = multer();

// Middleware untuk parsing JSON dan URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes);

app.use(express.json());

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

