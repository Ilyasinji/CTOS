const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const Offense = require('../models/Offense');

// Reset driver data - waa inuu noqdaa kii ugu horreeyay
router.post('/reset', async (req, res) => {
  try {
    // Delete existing drivers
    await Driver.deleteMany({});
    
    // Add sample drivers
    const sampleDrivers = [
      {
        name: "ilyas A. samadoon",
        email: "aqoon2017@gmail.com",
        licenseNumber: "21223",
        vehicleNumber: "24354676",
        phoneNumber: "03307999577",
        address: "650 Rivendell Drive",
        offences: 3,
        status: 'active'
      },
      {
        name: "yonis ahmed",
        email: "yonis@gmail.com",
        licenseNumber: "47357",
        vehicleNumber: "23234",
        phoneNumber: "614534535",
        address: "wadajir",
        offences: 1,
        status: 'active'
      }
    ];

    const savedDrivers = await Driver.insertMany(sampleDrivers);
    console.log('Drivers reset successfully:', savedDrivers);
    res.json({ message: 'Driver data reset successfully', drivers: savedDrivers });
  } catch (err) {
    console.error('Error resetting drivers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get stats - waa inuu ka horreeyaa dynamic routes-ka
router.get('/stats', async (req, res) => {
  try {
    const drivers = await Driver.find();
    const totalDrivers = drivers.length;
    const activeVehicles = drivers.length; // ama waxaad isticmaali kartaa filter kale
    const driversWithOffences = drivers.filter(d => d.offences > 0).length;

    res.json({
      stats: {
        totalDrivers,
        activeVehicles,
        driversWithOffences
      },
      drivers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search endpoint - waa inuu ka horreeyaa dynamic routes-ka
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const drivers = await Driver.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { licenseNumber: { $regex: query, $options: 'i' } },
        { vehicleNumber: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all drivers
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all drivers');
    const drivers = await Driver.find().sort('-createdAt');
    
    // Get offense counts for each driver
    const offenseCounts = await Promise.all(
      drivers.map(async (driver) => {
        const count = await Offense.countDocuments({ driver: driver._id });
        return {
          _id: driver._id,
          count
        };
      })
    );

    // Map offense counts to drivers
    const driversWithOffenses = drivers.map(driver => {
      const offenseCount = offenseCounts.find(count => count._id.toString() === driver._id.toString());
      return {
        ...driver.toObject(),
        offences: offenseCount ? offenseCount.count : 0
      };
    });

    console.log('Found drivers:', driversWithOffenses.length);
    res.json(driversWithOffenses);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Intii hoos ka socota way iska jiri karaan sidii hore

// Create new driver
router.post('/', async (req, res) => {
  try {
    console.log('Received new driver request:', req.body);

    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.licenseNumber || !req.body.vehicleNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const driver = new Driver({
      name: req.body.name,
      email: req.body.email,
      licenseNumber: req.body.licenseNumber,
      vehicleNumber: req.body.vehicleNumber,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      image: req.body.image,
      offences: 0,
      status: 'active'
    });

    console.log('Created driver object:', driver);

    const savedDriver = await driver.save();
    console.log('Driver saved successfully:', savedDriver);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver: savedDriver
    });

  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message
    });
  }
});

// Get specific driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (driver) {
      res.json(driver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating driver:', req.params.id);
    console.log('Update data:', req.body);

    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.licenseNumber || !req.body.vehicleNumber) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      licenseNumber: req.body.licenseNumber,
      vehicleNumber: req.body.vehicleNumber,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
    };

    // Only update image if a new one is provided
    if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    console.log('Driver updated successfully:', updatedDriver);
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Delete related payments first
    await Payment.deleteMany({ driver: driver._id });
    
    // Delete related offenses
    await Offense.deleteMany({ driver: driver._id });
    
    // Then delete the driver
    await driver.deleteOne();
    
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Error deleting driver:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 