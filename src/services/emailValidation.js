require("dotenv").config();

const dns = require("dns");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// const { google } = require("googleapis");

// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   "http://localhost:3000/register"
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN,
// });

function isValidEmailFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function checkDomain(email, callback) {
  const domain = email.split("@")[1];
  dns.resolve(domain, "MX", (err, addresses) => {
    if (err || addresses.length === 0) {
      callback(false);
    } else {
      callback(true);
    }
  });
}

async function sendVerificationEmail(email, name, password) {
  try {
    // const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_APP_PASSWORD
        // type: "OAuth2",
        // clientId: process.env.CLIENT_ID,
        // clientSecret: process.env.CLIENT_SECRET,
        // refreshToken: process.env.REFRESH_TOKEN,
        // accessToken: accessToken.token,
      },
    });

    const token = jwt.sign(
      {
        email: email,
        name: name,
        password: password,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationUrl = `${process.env.BASE_URL}${process.env.PORT}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT,
      to: email,
      subject: "Email Verification",
      text: "Please verify your email address by clicking the following link",
      html: `<p>Please verify your email address by clicking the following link: <a href="${verificationUrl}">[Verification Link]</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {  
      if (error) {
        console.error("Error during sending email:", error);
      } else {
        console.log("Verification email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error during OAuth2 process:", error);
  }
}

module.exports = { isValidEmailFormat, checkDomain, sendVerificationEmail };
