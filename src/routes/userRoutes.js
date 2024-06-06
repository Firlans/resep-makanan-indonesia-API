"use strict";

const express = require("express");

const { upload } = require("../services/upload");
const {
  register,
  login,
  forgetPassword,
  editProfile,
  verifyEmail,
  getProfile,
  resetPassword,
  deleteAccount
} = require("../controllers/userController");
const authorization = require("../services/auth");

// router variable
const router = express.Router();

// route
router.get("/login", login);
router.post("/register", register);
router.get("/verify-email", verifyEmail); // via email
router.get("/profile", authorization, getProfile);
router.post("/forget-password", forgetPassword);
router.post(
  "/profile/edit",
  authorization,
  upload.single("avatar"),
  editProfile
);
router.get("/reset-password", resetPassword); // via email
router.delete("/:user/delete", deleteAccount);

module.exports = router;
