const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/checkAuth');
const fileUpload = require('../middleware/fileUpload');

const {
  getPlaces,
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace } = require('../controllers/placesControllers');

const router = express.Router();

router.get('/', getPlaces);

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getPlacesByUserId);

router.use(checkAuth);

router.post('/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description')
      .isLength({ min: 5 }),
    check('address')
      .isLength({ min: 10 }),
  ],
  createPlace);

router.patch('/:pid',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description')
      .isLength({ min: 5 }),
    check('address')
      .isLength({ min: 10 })
  ],
  updatePlace);

router.delete('/:pid', deletePlace);

module.exports = router;