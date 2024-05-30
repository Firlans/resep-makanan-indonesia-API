"use strict";

const express = require("express");

const { upload } = require("../services/upload");
const {
  register,
  login,
  forgetPassword,
  editProfile,
  verifyEmail
} = require("../controllers/userController");
const authorization = require("../services/auth");

const router = express.Router();

router.get("/login", login);
router.post("/register", register);
router.get('/verify-email', verifyEmail);
router.get("/profile", authorization, (req, res) => {
  return res.json(req.user);
});
router.post("/forget_password", forgetPassword);
router.post(
  "/profile/edit",
  authorization,
  upload.single("avatar"),
  editProfile
);

// router.delete("/delete_account", deleteAccount);

module.exports = router;
