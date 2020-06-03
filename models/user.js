const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }], // array = many to one
  // addl user fields to add later
  // postcode: { type: String, required: true },
  // facebook: { type: String, required: false },
  // twitter: { type: String, required: false },

});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema); // db: users