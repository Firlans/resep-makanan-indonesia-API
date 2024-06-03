"use strict";

const express = require("express");

const routes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(routes);

app.use(express.json());

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

