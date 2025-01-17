const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Offense = require('../models/Offense'); // Assuming Offense model is defined in '../models/Offense.js'
const Payment = require('../models/Payment'); // Assuming Payment model is defined in '../models/Payment.js'
const auth = require('../middleware/auth');
const checkUserAccess = require('../middleware/checkUserAccess');

// Get driver profile (protected & access controlled)
router.get('/profile/:id', auth, checkUserAccess, async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new driver (protected)
router.post('/', auth, async (req, res) => {
    try {
        console.log('Helitaanka codsiga cusub:', req.body);
        
        const driver = await Driver.create({
            ...req.body,
            user: req.user.id  // Link driver to user account
        });
        console.log('Driver-ka la keydiyey:', driver);
        
        res.status(201).json(driver);
    } catch (error) {
        console.error('Khalad dhacay:', error);
        res.status(400).json({ 
            message: 'Khalad ayaa dhacay',
            error: error.message 
        });
    }
}); 

// Update driver (protected & access controlled)
router.put('/:id', auth, checkUserAccess, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get driver data by email (protected)
router.get('/data/:email', auth, async (req, res) => {
    try {
        const driver = await Driver.findOne({ email: req.params.email });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Get driver's offences and payments
        const offences = await Offense.find({ driverId: driver._id });
        const payments = await Payment.find({ driverId: driver._id });

        res.json({
            driver,
            offences,
            payments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;