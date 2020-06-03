const jwt = require('jsonwebtoken');
const { JWT_KEY } = process.env;
const HttpError = require('../models/HttpError');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  };
  try {
    const token = req.headers.authorization.split(' ')[1];
    // Authorization:  'Bearer TOKEN'
    if (!token) {
      throw new Error('Authorization failed')
    }
    const decodedToken = jwt.verify(token, 'dontchangethisstring');
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authorization header token not received', 403);
    return next(error);
  }
};