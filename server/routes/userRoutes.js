const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /user/profile/:username
router.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;
    // Find user by username in MongoDB
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user details as JSON
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get user details by ID
router.get('/:userID', async (req, res) => {
  try {
    const userID = req.params.userID;
    // Find user by ID in MongoDB
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user details as JSON
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

router.put('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUserData = req.body;

    const existingUsername = await User.findOne({ username: updatedUserData.username, _id: { $ne: userId } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Update user data in the database
    await User.findByIdAndUpdate(userId, updatedUserData);

    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/searchUsers', async (req, res) => {
  try {
      const { username, currentUsername } = req.body;
    
      // Find users matching the search query, excluding the current user's username
      const users = await User.find({ username: { $regex: username, $options: 'i', $ne: currentUsername } });

      res.json(users);
  } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;