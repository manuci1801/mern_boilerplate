const nodemailer = require("nodemailer");

const { EMAIL_TYPE } = require("../config/keys");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "123456khj001@gmail.com",
    pass: "Panel123@@",
  },
});

const sendMail = async (to, subject, data, type) => {
  let htmlBody;
  switch (type) {
    case EMAIL_TYPE.VERIFY_USER:
      htmlBody = `<b>Verify user: ${data}</b>`;
      break;

    default:
      break;
    //   return;
  }

  await transporter.sendMail({
    from: "munumber2",
    to,
    subject,
    html: htmlBody,
  });
};

module.exports = {
  sendMail,
};
