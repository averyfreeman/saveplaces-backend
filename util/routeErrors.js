const fs = require('fs');
const HttpError = require('../models/HttpError');

const invalidRoute = (req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  return next(error);
};

const unknownError = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => console.log(err));
  }
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || 'An unknown error has occurred' })
};



module.exports = {
  invalidRoute,
  unknownError
}