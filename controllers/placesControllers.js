// const mergeWith = require('lodash.mergewith');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/HttpError');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaces = async (req, res, next) => {
  let places;
  try {
    places = await Place.find();
  } catch (err) {
    let error = new HttpError(
      `Could not return list of places`,
      500);
    return next(error);
  };
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const getPlaceById = async (req, res, next) => {

  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    let error = new HttpError(
      `Could not find place named "${place.title}"`,
      500);
    return next(error);
  };

  if (!place) {
    let error = new HttpError(
      `Could not find place named "${place.title}"`,
      404);
    return next(error);
  };
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  const user = await User.findById(userId);

  let places;
  try {
    response = await User.findById(userId)
      .populate('places');
    places = response.places;
  } catch (err) {
    let error = new HttpError(
      `Could not find place(s) created by "${user.name}"`,
      500);
    return next(error);
  };

  if (!places || places.length === 0) {
    return next(new HttpError(
      `Could not find place(s) created by "${user.name}"`,
      404));
  };

  res.json({
    places: places.map(place => place
      .toObject({ getters: true }))
  });
};

const createPlace = async (req, res, next) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let error = new HttpError(
      `Please be sure all fields are properly entered`,
      422);
    return next(error);
  }
  const { title, description, address } = req.body;
  const creator = req.userData.userId;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    error = new HttpError('Please enter a more accurate address', 500);
    return next(error);
  };

  const createdPlace = new Place({
    title,
    description,
    address,
    creator,
    image: req.file.path,
    location: coordinates,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    let error = new HttpError(
      `Creating place failed, please try again`,
      500);
    return next(error);
  };

  if (!user) {
    let error = new HttpError(
      `Could not find user for id ${creator}`,
      500);
    return next(error);
  };

  try {

    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();

  } catch (err) {
    let error = new HttpError(
      'Creating place failed, please try again',
      500
    );
    return next(error)
  };

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {

  const placeId = req.params.pid;
  const { title, description, address } = req.body;

  let place;
  try {
    place = await Place.findById(placeId);
  }
  catch (err) {
    let error = new HttpError(
      `Something went wrong updating place id ${placeId}`,
      500);
    return next(error);
  };

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      `Not authorized to update place with id ${placeId}`,
      401);
    return next(error);
  };

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    error = new HttpError('Please enter a more accurate address', 500);
    return next(error);
  };

  place.title = title;
  place.description = description;
  place.address = address;
  place.location = coordinates;

  try {
    await place.save()
  } catch (err) {
    const error = new HttpError(
      `something went wrong updating place id ${placeId}`,
      500);
    return next(error);
  };

  res.status(200).json({
    place: place
      .toObject({ getters: true })
  });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId)
      .populate('creator')
  } catch (err) {
    let error = new HttpError(
      `Could not find place with id ${placeId} to delete`,
      500);
    return next(error);
  };


  if (!place) {
    let error = new HttpError(
      `Could not find place with id ${placeId}`,
      404);
    return next(error);
  };

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      `Not authorized to delete place with id ${placeId}`,
      401);
    return next(error);
  };

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.deleteOne({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (err) {
    let error = new HttpError(
      `Could not find place with id ${placeId} to delete`,
      500);
    return next(error);
  };

  res.status(200).json({
    message: `Place ${placeId} "${place.name}" has been deleted`
  });
};

module.exports = {
  getPlaces,
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace
};