const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../models/HttpError');

const getUsers = async (req, res, next) => {

  let users;
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    let error = new HttpError(
      `User list could not be returned`,
      500)
    return next(error)
  }

  res.json({
    users: users.map(user => user
      .toObject({ getters: true }))
  });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId, '-password');
  } catch (err) {
    let error = new HttpError(
      `User with id ${userId} could not be located`,
      500)
    return next(error)
  }

  res.json({ user });
}

const signUp = async (req, res, next) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let error = new HttpError(
      `Please be sure all fields are properly entered`,
      422);
    return next(error);
  }

  const { name, email, password } = req.body;
  const { JWT_KEY } = process.env;

  let existingUser;
  try {
    existingUser = await User.findOne({ email })
  } catch (err) {
    let error = new HttpError(
      `Backend failure, please try again later`,
      500);
    return next(error);
  }

  if (existingUser) {
    let error = new HttpError(
      `User with ${email} email already exists.  Please check spelling, or login if you have an account`,
      422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(password, 12);
  } catch {
    let error = new HttpError(
      `Could not create user, please try again`,
      500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save()
  } catch (err) {
    let error = new HttpError(
      `Issue creating user, try again later`,
      500);
    return next(error);
  };

  let token;
  try {
    token = jwt.sign({
      userId: createdUser.id,
      email: createdUser.email
    },
      JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    let error = new HttpError(
      `Signup failed, please try again`,
      500);
    return next(error);
  };


  res.status(201).json({
    userId: createdUser.id, email: createdUser.email,
    token
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { JWT_KEY } = process.env;

  let existingUser;
  let userId;
  try {
    existingUser = await User.findOne({ email });
    existingUser = existingUser.toObject({ getters: true });
  } catch (err) {
    let error = new HttpError(
      `Could not find user with email ${email} - do you need to sign up?`,
      500);
    return next(error);
  };

  if (!existingUser) {
    let error = new HttpError(
      `Credentials not found`,
      403);
    return next(error);
  };

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    let error = new HttpError(
      `Could not log you in, please check credentials and try again`,
      500);
    return next(error);
  };

  if (!isValidPassword) {
    let error = new HttpError(
      `Invalid credentials, please check and try again`,
      403);
    return next(error);
  };

  let token;
  try {
    token = jwt.sign({
      userId: existingUser.id,
      email: existingUser.email
    },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
    userId = existingUser.id;
  } catch (err) {
    let error = new HttpError(
      `Signup failed, please try again`,
      500);
    return next(error);
  };

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token
  })
}

module.exports = {
  getUsers,
  getUserById,
  signUp,
  login
}