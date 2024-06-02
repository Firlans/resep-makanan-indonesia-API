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
  resetPassword
} = require("../controllers/userController");
const authorization = require("../services/auth");

const router = express.Router();

router.get("/login", login);
router.get("/register", register);
router.post("/verify-email", verifyEmail);
router.get("/profile", authorization, getProfile);
router.get("/forget-password", forgetPassword);
router.post(
  "/profile/edit",
  authorization,
  upload.single("avatar"),
  editProfile
);
router.post("/reset-password", resetPassword);
// router.delete("/:user/delete", deleteAccount);

module.exports = router;
