const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Offense = require('../models/Offense');
const Payment = require('../models/Payment');

const driversRouter = require('./drivers');
const offensesRouter = require('./offenses');
const paymentsRouter = require('./payments');

// Define sample data
const sampleDrivers = [
    {
        name: "Abdi Hassan",
        email: "abdi@gmail.com",
        licenseNumber: "123",
        vehicleNumber: "SOM-123",
        phoneNumber: "615666768",
        address: "Mogadishu",
        offences: 1,
        status: 'active'
    },
    {
        name: "ibarahim",
        email: "ibarahim@gmail.com",
        licenseNumber: "12345678",
        vehicleNumber: "SOM-1234",
        phoneNumber: "617878787",
        address: "banaidir",
        offences: 2,
        status: 'active'
    },
    {
        name: "Abiib",
        email: "jfhusegfj@gmail.com",
        licenseNumber: "342323",
        vehicleNumber: "SOM-123",
        phoneNumber: "76273684",
        address: "fhushfunjs",
        offences: 1,
        status: 'active'
    },
    {
        name: "muxudiin",
        email: "mgdifg@gmail.com",
        licenseNumber: "5756756",
        vehicleNumber: "SOM-765687",
        phoneNumber: "645746",
        address: "wadajir",
        offences: 1,
        status: 'active'
    }
];

const sampleOffenses = [
    {
        driverName: "Abdi Hassan",
        vehicleNumber: "SOM-123",
        offense: "Speeding",
        location: "warta",
        date: new Date('2024-12-12'),
        fine: 100,
        status: "Paid"
    },
    {
        driverName: "ibarahim",
        vehicleNumber: "SOM-1234",
        offense: "No License",
        location: "xamar Weyne",
        date: new Date('2024-12-14'),
        fine: 50,
        status: "Paid"
    },
    {
        driverName: "ibarahim",
        vehicleNumber: "SOM-1234",
        offense: "Red Light",
        location: "xl",
        date: new Date('2024-12-13'),
        fine: 45,
        status: "Paid"
    },
    {
        driverName: "Abiib",
        vehicleNumber: "SOM-123",
        offense: "Parking",
        location: "sfsjdhfj",
        date: new Date('2024-12-14'),
        fine: 45454,
        status: "Paid"
    },
    {
        driverName: "muxudiin",
        vehicleNumber: "SOM-765687",
        offense: "Red Light",
        location: "wadajir",
        date: new Date('2024-12-15'),
        fine: 100,
        status: "Paid"
    }
];

// System reset endpoint
router.post('/system/reset', async (req, res) => {
    try {
        console.log('Starting system reset...');
        
        // Force delete all collections
        await Promise.all([
            Driver.deleteMany({}),
            Offense.deleteMany({}),
            Payment.deleteMany({})
        ]);

        // Wait a moment to ensure deletions are complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add sample data
        const savedDrivers = await Driver.insertMany(sampleDrivers);
        console.log('Sample drivers added:', savedDrivers.length);

        const offensesWithDrivers = sampleOffenses.map(offense => {
            const driver = savedDrivers.find(d => d.name === offense.driverName);
            if (!driver) {
                throw new Error(`Driver not found for offense: ${offense.driverName}`);
            }
            return {
                ...offense,
                driver: driver._id
            };
        });

        const savedOffenses = await Offense.insertMany(offensesWithDrivers);
        console.log('Sample offenses added:', savedOffenses.length);

        const payments = savedOffenses.map(offense => ({
            driverName: offense.driverName,
            vehicleNumber: offense.vehicleNumber,
            amount: offense.fine,
            paymentMethod: "Cash",
            status: "Completed",
            date: offense.date,
            offense: offense._id,
            driver: offense.driver
        }));

        await Payment.insertMany(payments);
        console.log('Sample payments added');

        // Verify all data is reset
        const counts = await Promise.all([
            Driver.countDocuments(),
            Offense.countDocuments(),
            Payment.countDocuments()
        ]);

        console.log('Final counts:', {
            drivers: counts[0],
            offenses: counts[1],
            payments: counts[2]
        });

        res.json({ 
            message: 'System reset successful',
            details: 'All data cleared and sample data restored'
        });

    } catch (error) {
        console.error('System reset error:', error);
        res.status(500).json({ 
            message: 'Error resetting system',
            error: error.message 
        });
    }
});

// Mount other routes
router.use('/drivers', driversRouter);
router.use('/offenses', offensesRouter);
router.use('/payments', paymentsRouter);

// Test endpoint
router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

module.exports = router; 