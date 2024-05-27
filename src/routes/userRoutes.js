"use strict"

const express = require("express");

const { 
    register, 
    login,
    resetPassword,
    authentication
} = require("../controllers/userController");

const router = express.Router();

router.get("/login", login);
router.post("/register", register);

router.get("/profile", authentication ,(req, res) => {
    return res.json(req.user);
})
router.post("/reset_password", resetPassword);
// router.post("/profile/edit", editProfile)

// router.delete("/delete_account", deleteAccount);

module.exports = router;


