const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Driver = require('../models/Driver');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get user settings
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let additionalInfo = null;
    
    if (req.user.role === 'driver') {
      additionalInfo = await Driver.findOne({ user: req.user.id });
    }
    
    res.json({
      user,
      additionalInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user settings
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // If driver, update driver info
    if (req.user.role === 'driver') {
      const { licenseNumber, vehicleNumber } = req.body;
      const driver = await Driver.findOne({ user: req.user.id });
      
      if (driver) {
        if (licenseNumber) driver.licenseNumber = licenseNumber;
        if (vehicleNumber) driver.vehicleNumber = vehicleNumber;
        await driver.save();
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
