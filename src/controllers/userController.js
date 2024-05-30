"use strict";

const jwt = require("jsonwebtoken");
const { uploadToGCS } = require("../services/upload");
const emailValidation = require("../services/emailValidation");
const store = require("../services/storeData");

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

    users.map((user, index) => {
      if (user.email == email && user.password === password) {
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            idAvatar: user.idAvatar,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(200).json({
          status: "success",
          message: "Login successful",
          token,
        });
      } else if (user.email === email && user.password !== password) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid password",
        });
      }
      if (index + 1 === users.length) {
        return res.status(401).json({
          status: "fail",
          message: "email not registered",
        });
      }
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

    console.log(duplicateAccount);
    if (duplicateAccount) {
      return res.status(409).json({
        status: "fail",
        message: "email already exists",
      });
    }

    emailValidation.checkDomain(email, (isValidDomain) => {
      if (!isValidDomain) {
        return res.status(400).json({ error: "Invalid email domain." });
      }

      emailValidation.sendVerificationEmail(email, name, password);
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
    const { email, name, password } = jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({ error: "Invalid or expired token." });
        }
        return decoded;
      }
    );
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const idAvatar = "avatar-0";
    const phoneNumber = "";
    const user = {
      email,
      name,
      password,
      phoneNumber,
      idAvatar,
      createdAt,
      updatedAt,
    };
    const users = await store.getUsers();
    await store.addUser(user);

    return res.status(201).json({
      status: "success",
      message: "Email successfully verified!",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

// forget password handler
const forgetPassword = (req, res) => {
  const userId = req.params.user_id;
  res.status(200).json({
    status: "success",
    message: "your password have reseted",
  });
};

// edit profile handler
const editProfile = async (req, res) => {
  const file = req.file;
  const user = req.user;
  const edited = req.query;

  // data validate
  if (!file) {
    return res.status(400).json({ message: "Please upload a file!" });
  }

  if (!edited) {
    res.status(400).json({
      status: "fail",
      message: "nothing changed",
    });
  }

  const avatarBucket = "my-project-avatar-bucket";

  try {
    const dbUsers = await store.getUsers();

    const userData = dbUsers.find((userData) => userData.id === user.id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    await store.updateUser(user.id, edited);

    userData.name = edited.name;
    userData.phoneNumber = edited.phoneNumber;

    const newToken = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        idAvatar: userData.idAvatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await uploadToGCS(file, user.id, avatarBucket);
    res.json({ message: "Profile updated successfully", token: newToken });
  } catch (error) {
    console.error(error);
    res.send("gagal menyimpan");
  }
};

module.exports = {
  login,
  register,
  forgetPassword,
  editProfile,
  verifyEmail,
};
