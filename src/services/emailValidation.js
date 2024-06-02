require("dotenv").config();

const dns = require("dns");
const nodemailer = require("nodemailer");

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

async function sendVerificationEmail(verificationUrl, email, message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ACCOUNT,
      pass: process.env.EMAIL_APP_PASSWORD
    },
  });
  try {
    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT,
      to: email,
      subject: "Email Verification",
      text: message,
      html: `<p>${message}: <a href="${verificationUrl}">[Verification Link]</a></p>`,
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
