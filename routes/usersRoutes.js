const express = require('express');
const { check } = require('express-validator');

const {
  getUsers,
  getUserById,
  signUp,
  login } = require('../controllers/usersController');
const fileUpload = require('../middleware/fileUpload');

const router = express.Router();

router.get('/', getUsers);

router.get('/:uid', getUserById);

router.post('/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password')
      .isLength({ min: 5 })
  ],
  signUp);

router.post('/login', login);

module.exports = router;