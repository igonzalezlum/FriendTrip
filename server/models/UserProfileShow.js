const mongoose = require('mongoose');

const userProfileShowSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  usernameShow: { type: Boolean, default: false },
  firstnameShow: { type: Boolean, default: false },
  lastnameShow: { type: Boolean, default: false },
  ageShow: { type: Boolean, default: false },
  countryShow: { type: Boolean, default: false },
  cityShow: { type: Boolean, default: false },
  socialMediaShow: { type: Boolean, default: false },
});

const UserProfileShow = mongoose.model('UserProfileShow', userProfileShowSchema);

module.exports = UserProfileShow;