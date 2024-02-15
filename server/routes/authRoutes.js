const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserProfileShow = require('../models/UserProfileShow');

// Helper function to validate the password
const isPasswordValid = (password) => {
  // Check if the password has at least one special character and is at least 8 characters long
  const passwordRegex = /^(?=.*[!_@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z0-9]).{8,}$/;
  return passwordRegex.test(password);
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, firstname, lastname, age, country, city, profilePicture } = req.body;

    // Check if the passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if the password is valid
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long and contain at least one special character',
      });
    }

    // Check if the email is already registered
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      password,
      firstname,
      lastname,
      age,
      country,
      city,
      profilePicture,
    });
    await newUser.save();

    const newUserProfileShow = new UserProfileShow({
      userID: newUser._id,
      // Default visibility preferences
      usernameShow: true,
    });
    await newUserProfileShow.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({user: user, message: 'User logged in' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;