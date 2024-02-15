const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

// GET /trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ startDate: +1 }); // Retrieve all trips from the database
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST /trips/create
router.post('/create', upload.array('images'), async (req, res) => {

  try {
    const { tripData } = req.body;
    const trip = JSON.parse(tripData);

    // Create a new trip instance using the Mongoose model
    const newTrip = new Trip({
      creator: trip.creator,
      participants: trip.participants,
      city: trip.city,
      country: trip.country,
      continent: trip.continent,
      startDate: trip.startDate,
      endDate: trip.endDate,
      nights: trip.nights,
      maxParticipants: trip.maxParticipants,
      gallery: trip.gallery,
    });

    // Save the trip to MongoDB
    const savedTrip = await newTrip.save();

    const tripFolderPath = path.join(__dirname, '../../client/public/images/trips', savedTrip._id.toString(), 'gallery');
    if (!fs.existsSync(tripFolderPath)) {
      fs.mkdirSync(tripFolderPath, { recursive: true });
    }

    // Move uploaded images to the trip gallery folder
    req.files.forEach((file) => {
      const imagePath = path.join(tripFolderPath, file.originalname);
      fs.renameSync(file.path, imagePath);
    });

    console.log('Trip created successfully:', savedTrip);
    res.json({ message: 'Trip created successfully', trip: savedTrip });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// GET route to fetch trip details by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (trip) {
      res.json(trip);
    } else {
      res.status(404).json({ error: 'Trip not found' });
    }
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch created trips for a specific user
router.get('/created/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const createdTrips = await Trip.find({ creator: userId });
    res.json(createdTrips);
  } catch (error) {
    console.error('Error fetching created trips:', error);
    res.status(500).json({ message: 'Failed to fetch created trips' });
  }
});

// Route to fetch joined trips for a specific user
router.get('/joined/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Assuming participants is an array of user IDs
    const joinedTrips = await Trip.find({ participants: userId, creator: { $ne: userId } });
    res.json(joinedTrips);
  } catch (error) {
    console.error('Error fetching joined trips:', error);
    res.status(500).json({ message: 'Failed to fetch joined trips' });
  }
});

router.get('/showDetails/:tripID', async (req, res) => {
  const tripId = req.params.tripID;

  if (!tripId) {
    return res.status(400).json({ message: 'Trip ID is required' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ message: `Server error ${tripId}` });
  }
});

// Update information of the trip
router.put('/update/:tripID', upload.array('images'), async (req, res) => {
  const tripId = req.params.tripID;

  const { tripData } = req.body;
  const updatedTripData = JSON.parse(tripData);

  const newImages = req.files;

  try {
    // Update trip details
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, updatedTripData, { new: true });

    // Create trip folder if it doesn't exist
    const tripFolderPath = path.join(__dirname, '../../client/public/images/trips', updatedTripData._id.toString(), 'gallery');
    if (!fs.existsSync(tripFolderPath)) {
      fs.mkdirSync(tripFolderPath, { recursive: true });
    }

    // Move uploaded images to the trip folder
    newImages.forEach((file) => {
      const imagePath = path.join(tripFolderPath, file.originalname);
      fs.renameSync(file.path, imagePath);
    });

    // Save the updated trip with new images
    const savedTrip = await updatedTrip.save();

    res.json(savedTrip); // Return the updated trip object
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Error updating trip details' });
  }
});

// DELETE route to remove a participant from a trip
router.delete('/:tripId/participants/:participantID', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const participantID = req.params.participantID;

    // Find the trip by its ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Remove the participant from the trip's participants array
    trip.participants = trip.participants.filter(participant => participant !== participantID);

    // Save the updated trip
    const updatedTrip = await trip.save();

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error removing participant from trip:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/deleteImages', async (req, res) => {
  try {
      const { tripId, deletedImages } = req.body;

      // Construct the path to the trip's gallery folder
      const galleryFolderPath = path.join(__dirname, '../../client/public/images/trips', tripId.toString(), 'gallery');

      // Iterate through the list of deleted images and delete them from the folder
      deletedImages.forEach(imageName => {
          const imagePath = path.join(galleryFolderPath, imageName);
          if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
          }
      });

      res.json({ message: 'Images deleted successfully' });
  } catch (error) {
      console.error('Error deleting images:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;