"use strict";

const crypto = require("crypto");

const connection = require("../services/storeData");

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
    const users = await connection.getUsers();
    
    users.map((user, index) => {
      if (user.email == email && user.password === password) {
        return res.status(200).json({
          status: "success",
          message: "Login successful",
          data: user
        });
      }else if (user.email === email && user.password !== password) {
        return res.status(401).json({ 
          status: "fail",
          message: "Invalid password" });
      }
      if (index+1 === users.length) {
        return res.status(401).json({
          status: "fail",
          message: "email not registered",
        });
      }
    });
  } catch (error) {
    if(error){
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
    const users = await connection.getUsers();
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

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const idAvatar = avatar ? (idAvatar = crypto.randomUUID()) : "default";

    const query =
      "INSERT INTO users (id, name, email, password, idAvatar) VALUES (?, ?, ?, ?, ?)";

    // user data variable
    const user = {
      id,
      email,
      name,
      password,
      idAvatar,
      createdAt,
      updatedAt,
    };

    const values = [id, name, email, password, idAvatar];
    await connection.saveData(query, values);
    return res.status(201).json({
      status: "success",
      message: "user registered successfully",
      data: { id, email, name, idAvatar },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  login,
  register,
};
