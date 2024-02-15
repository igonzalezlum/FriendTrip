const express = require('express');
const router = express.Router();
const Solicitude = require('../models/Solicitude');
const Trip = require('../models/Trip');

// Route to create a new solicitude
router.post('/', async (req, res) => {
    try {
        // Extract tripID and creatorUsername from the request body
        const { tripID, creatorUsername, currentUserID } = req.body;
        // Create a new solicitude
        const newSolicitude = new Solicitude({
            tripId: tripID,
            senderUser: currentUserID,
            recipientUser: creatorUsername,
        });

        // Save the new solicitude to the database
        const savedSolicitude = await newSolicitude.save();

        res.status(201).json(savedSolicitude);
    } catch (error) {
        console.error('Error creating solicitude:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/received', async (req, res) => {
    try {
        const { recipientUser } = req.body;
        // Find solicitudes where the recipientUser matches the current user's username
        const receivedSolicitudes = await Solicitude.find({ recipientUser }).sort({ createdAt: -1 });
        res.json(receivedSolicitudes);
    } catch (error) {
        console.error('Error fetching received solicitudes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/sent', async (req, res) => {
    try {
        const { senderUser } = req.body;
        // Find solicitudes where the senderUser matches the current user's username
        const sentSolicitudes = await Solicitude.find({ senderUser }).sort({ createdAt: -1 });
        res.json(sentSolicitudes);
    } catch (error) {
        console.error('Error fetching sent solicitudes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to accept a solicitude
router.post('/:solicitudeId/accept', async (req, res) => {
    try {
        const { solicitudeId } = req.params;

        // Find the solicitude by ID
        const solicitude = await Solicitude.findById(solicitudeId);
        if (!solicitude) {
            return res.status(404).json({ error: 'Solicitude not found' });
        }

        // Update the solicitude status to 'accepted'
        solicitude.status = 'accepted';
        await solicitude.save();

        // Add the sender to the participants of the trip
        const trip = await Trip.findById(solicitude.tripId);
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        trip.participants.push(solicitude.senderUser);
        await trip.save();

        res.json({ message: 'Solicitude accepted successfully' });
    } catch (error) {
        console.error('Error accepting solicitude:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to reject a solicitude
router.post('/:solicitudeId/reject', async (req, res) => {
    try {
        const { solicitudeId } = req.params;

        // Find the solicitude by ID
        const solicitude = await Solicitude.findById(solicitudeId);
        if (!solicitude) {
            return res.status(404).json({ error: 'Solicitude not found' });
        }

        // Update the solicitude status to 'rejected'
        solicitude.status = 'rejected';
        await solicitude.save();

        res.json({ message: 'Solicitude rejected successfully' });
    } catch (error) {
        console.error('Error rejecting solicitude:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE request to cancel a solicitude
router.delete('/:solicitudeId/cancel', async (req, res) => {
    try {
        const { solicitudeId } = req.params;
        
        // Find the solicitude by ID and remove it
        const deletedSolicitude = await Solicitude.findByIdAndDelete(solicitudeId);

        if (!deletedSolicitude) {
            return res.status(404).json({ message: 'Solicitude not found' });
        }

        res.status(200).json({ message: 'Solicitude canceled successfully' });
    } catch (error) {
        console.error('Error canceling solicitude:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;