const express = require('express');
const router = express.Router();
const UserProfileShow = require('../models/UserProfileShow');

router.get('/:userId', async (req, res) => {
    try {
        const userID = req.params.userId;
        // console.log('User ID:', userID);

        const preferences = await UserProfileShow.findOne({ userID: userID });
        // console.log('Preferences:', preferences);

        res.json(preferences);
    } catch (error) {
        console.error('Error fetching user visibility preferences:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updatedPreferences = req.body;

        // Update the user's visibility preferences in the database
        const result = await UserProfileShow.findOneAndUpdate({ userID: userId }, updatedPreferences, { new: true });

        res.json(result); // You can customize the response as needed
    } catch (error) {
        console.error('Error updating user visibility preferences:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;