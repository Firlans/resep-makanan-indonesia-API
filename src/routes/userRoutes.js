"use strict"

const express = require("express");
const { register, login } = require("../controllers/userController");
const router = express.Router();

router.get("/login", login);
router.post("/register", register);

module.exports = router;


