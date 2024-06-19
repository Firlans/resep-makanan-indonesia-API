"use strict";
require("dotenv").config()

require('dotenv').config();
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
// Error handling middleware for multer and other errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Not an image! Please upload an image.") {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
  next(err);
});
app.listen(port, "0.0.0.0",() => {
  console.log(`server running on http://0.0.0.0:${port}`);
});

