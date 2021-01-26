const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");

const { keys, redisClient } = require("../config");
const { nodemailer } = require("../services");
const { signUpValidation, signInValidation } = require("../validation/auth");

const User = require("../models/User");

const signUp = async (req, res) => {
  try {
    const { isValid, errors } = signUpValidation(req.body);
    if (!isValid) return res.status(400).json(errors);

    const { name, username, email, password } = req.body;

    // save user to db
    const user = await new User({
      name,
      username,
      email,
      password: await argon2.hash(password),
    }).save();

    // save and send token verify
    const tokenVerify = await v4();
    await redisClient.set(
      tokenVerify,
      `${keys.VERIFY_USER_PREFIX}:${user._id}`
    );
    await redisClient.expire(tokenVerify, 60 * 15); // expire in 15 minutes
    nodemailer.sendMail(
      email,
      "Verify account",
      tokenVerify,
      keys.EMAIL_TYPE.VERIFY_USER
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ [field]: `${field} already exists` });
    }
    res.status(500).json(error);
  }
};

const signIn = async (req, res) => {
  try {
    const { isValid, errors } = signInValidation(req.body);
    if (!isValid) return res.status(400).json(errors);

    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user)
      return res.status(400).json({ usernameOrEmail: "user does not exists" });

    if (!user.isVerify)
      return res.status(400).json({
        usernameOrEmail:
          "user is not verified, please check your email to verify your account",
      });

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch)
      return res.status(400).json({ password: "password is wrong" });

    const payload = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = await jwt.sign(payload, keys.SECRET_KEY_JWT, {
      expiresIn: "3h",
    });

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const resendVerify = async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;

    // check is exist user
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user)
      return res.status(400).json({ usernameOrEmail: "user does not exists" });

    // save and send token verify
    const tokenVerify = await v4();
    await redisClient.set(
      tokenVerify,
      `${keys.VERIFY_USER_PREFIX}:${user._id}`
    );
    await redisClient.expire(tokenVerify, 60 * 15); // expire in 15 minutes
    nodemailer.sendMail(
      user.email,
      "Verify account",
      tokenVerify,
      keys.EMAIL_TYPE.VERIFY_USER
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    const key = await redisClient.get(token);
    if (!key) return res.status(400).json({ token: "invalid token" });

    const [prefix, userId] = key.split(":");
    if (prefix !== keys.VERIFY_USER_PREFIX) return res.json({ success: true });

    redisClient.del(token);
    await User.findByIdAndUpdate(userId, { isVerify: true }, { new: true });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  signUp,
  signIn,
  resendVerify,
  verifyUser,
};
