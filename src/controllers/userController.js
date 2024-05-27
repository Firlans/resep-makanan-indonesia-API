"use strict";

const jwt = require("jsonwebtoken");

const store = require("../services/storeData");

const authentication = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

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
          { id: user.id, email: user.email, idAvatar: user.idAvatar },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(200).json({
          status: "success",
          message: "Login successful",
          token,
        });
        // return res.status(200).json({
        //   status: "success",
        //   message: "Login successful",
        //   data: user
        // });
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

// register
const register = async (req, res) => {
  const { email, name, password, avatar } = req.query;
  try {
    const users = await store.getUsers();
    // validate data
    if (!email || !name || !password) {
      res.status(400).json({
        status: "fail",
        message: "email, name, password is required",
      });
    }

    users.map((user) => {
      if (email === user.email) {
        return res.status(409).json({
          status: "fail",
          message: "email already exists",
        });
      }
    });

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const idAvatar = avatar ? (idAvatar = nanoid(4)) : "default";

    // user data variable
    const user = {
      email,
      name,
      password,
      idAvatar,
      createdAt,
      updatedAt,
    };

    const values = [name, email, password, idAvatar];
    store.addUser(user);

    return res.status(201).json({
      status: "success",
      message: "user registered successfully",
      data: { email, name, idAvatar },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const resetPassword = (req, res) => {
  const userId = req.params.user_id;
  res.status(200).json({
    status: "success",
    message: "your password have reseted",
  });
};

module.exports = {
  login,
  register,
  resetPassword,
  authentication,
};
