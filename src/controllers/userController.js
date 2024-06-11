"use strict";

const jwt = require("jsonwebtoken");
const path = require("path")
const bcrypt = require('bcrypt');

const { uploadToGCS, deleteFile } = require("../services/storage");
const emailValidation = require("../services/emailValidation");
const store = require("../services/storeData");
const generateToken = require("../services/generateToken");


// login handler
const login = async (req, res) => {
  const { email, password } = req.query;

  // validate data
  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required",
    });
  }

  try {
    const users = await store.getUsers();

    // validate data user from database
    if (users.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "email not registered",
      });
    }
    const userAccount = users.find((user) => user.email === email);
    // email validation
    if (!userAccount) {
      return res.status(401).json({
        status: "fail",
        message: "email not registered",
      });
    }

    // password validation
    const match = await bcrypt.compare(password, userAccount.password);
    if (!match) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password",
      });
    }

    const dataClient = {
      email: userAccount.email,
      id: userAccount.id,
      name: userAccount.name,
      phoneNumber: userAccount.phoneNumber,
      idAvatar: userAccount.idAvatar,
    };
    const token = generateToken(dataClient);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    if (error) {
      console.error(error);
      return error;
    }
    return null;
  }
};

// register handler
const register = async (req, res) => {
  const { email, name, password } = req.query;
  try {
    const users = await store.getUsers();
    // validate data
    if (!email || !name || !password) {
      return res.status(400).json({
        status: "fail",
        message: "email, name, password is required",
      });
    }

    // email validation
    if (!emailValidation.isValidEmailFormat) {
      return res.json({
        status: "fail",
        message: "Invalid email format.",
      });
    }

    const duplicateAccount = users.find((user) => email === user.email);

    if (duplicateAccount) {
      return res.status(409).json({
        status: "fail",
        message: "email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    emailValidation.checkDomain(email, async (isValidDomain) => {
      if (!isValidDomain) {
        return res.status(400).json({ error: "Invalid email domain." });
      }
      const data = { email, name, hashedPassword };
      const token = generateToken(data);
      const verificationUrl = `${process.env.BASE_URL}${process.env.PORT}/verify-email?token=${token}`;
      const text =
        "Please verify your email address by clicking the following link";
      await emailValidation.sendVerificationEmail(verificationUrl, email, text);
      return res.status(200).json({
        status: "success",
        message: "Please check your email to verify your address.",
      });
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

// email verification handler
const verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "Invalid verification link." });
  }

  try {
    const { email, name, hashedPassword } = jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({ error: "Invalid or expired token." });
        }
        return decoded;
      }
    );

    const users = await store.getUsers();
    const duplicateAccount = users.find((userData) => userData.email === email);
    if (duplicateAccount) {
      return res.status(400).json({
        status: "fail",
        message: "email is already exist",
      });
    }

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const idAvatar = "avatar-0";
    const phoneNumber = "";
    const user = {
      email,
      name,
      password: hashedPassword,
      phoneNumber,
      idAvatar,
      createdAt,
      updatedAt,
    };
    await store.addUser(user);

    return res.status(201).json({
      status: "success",
      message: "Email successfully verified!  ",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

// forget password handler
const forgetPassword = async (req, res) => {
  try {
    const data = req.query;
    const users = await store.getUsers();
    const isEvailable = users.find((userData) => userData.email === data.email);
    if (!isEvailable) {
      res.status(401).json({
        status: "fail",
        message: "email is not registered yet",
      });
    }
    const token = generateToken(data);
    const verificationUrl = `${process.env.BASE_URL}${process.env.PORT}/reset-password?token=${token}`;
    const text = "please clicking this link for reset your password";
    await emailValidation.sendVerificationEmail(
      verificationUrl,
      data.email,
      text
    );

    res.status(200).json({
      status: "success",
      message: "Please check your email to verify your address",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

// edit profile handler
const editProfile = async (req, res) => {
  const file = req.file;
  const user = req.user;
  const edited = req.query;

  // data validation
  if (!file) {
    return res.status(400).json({ message: "Please upload a file!" });
  }

  // data changed validation
  if (!edited) {
    res.status(400).json({
      status: "fail",
      message: "nothing changed",
    });
  }

  const avatarBucket = process.env.AVATAR_BUCKET;

  try {
    const dbUsers = await store.getUsers();

    const userData = dbUsers.find((userData) => userData.id === user.id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const idAvatar = file ? `avatar-${user.id}${path.extname(file.originalname)}` : "avatar-0";
    userData.name = edited.name;
    userData.phoneNumber = edited.phoneNumber;
    userData.idAvatar = idAvatar;

    await store.updateUser(user.id, userData);

    const dataClient = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      idAvatar: userData.idAvatar,
    };
    const newToken = generateToken(dataClient);
    await uploadToGCS(file, idAvatar, avatarBucket);
    res.json({ message: "Profile updated successfully", token: newToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "fail",
      message: "gagal menyimpan",
    });
  }
};

// get profile handler
const getProfile = (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(400).json({
      status: "fail",
      message: "user account is not available",
    });
  }

  return res.status(200).json({
    status: "success",
    data: user,
  });
};

// reset password handler
const resetPassword = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Invalid verification link." });
  }
  try {
    const { email, newPassword } = jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({ error: "Invalid or expired token." });
        }
        return decoded;
      }
    );


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const users = await store.getUsers();
    const userAccount = users.find((userData) => userData.email === email);
    if (!userAccount) {
      return res.status(400).json({
        status: "fail",
        message: "email is not regitered yet",
      });
    }

    userAccount.password = hashedPassword;

    await store.updateUser(userAccount.id, userAccount);

    res.status(201).json({
      status: "success",
      message: "password has reseted",
    });
  } catch (error) {
    console.error(error);
  }
};

// delete account hanlder
const deleteAccount = async (req, res) => {
  const user = req.user;
  const password = req.query.password;
  if (!user.email) {
    res.status(400).json({
      status: "fail",
      message: "email is required",
    });
  }

  try {
    const users = await store.getUsers();

    const userTarget = users.find((userData) => userData.email === user.email);
    if (!userTarget) {
      res.status(400).json({
        status: "fail",
        message: "account is not available",
      });
    }

    const match = await bcrypt.compare(password, userTarget.password);
    
    if (!match) {
      return res.status(400).json({
        status: "fail",
        message: "password is not valid"
      })
    }
    await deleteFile(userTarget.idAvatar, process.env.AVATAR_BUCKET);
    await store.deleteUser("users", userTarget.id);
    return res.status(201).json({
      status: "success",
      message: "account was deleted"
    })
  } catch (error) {
    console.error(error);
    return null;
  }

};

module.exports = {
  login,
  register,
  forgetPassword,
  editProfile,
  verifyEmail,
  getProfile,
  resetPassword,
  deleteAccount,
};