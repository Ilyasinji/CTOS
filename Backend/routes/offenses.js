const express = require('express');
const router = express.Router();
const Offense = require('../models/Offense');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const { auth, checkRole } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const DeletionRequest = require('../models/DeletionRequest');

// Function to create audit log
const createAuditLog = async (userId, action, details, ipAddress) => {
    try {
        const auditLog = await AuditLog.create({
            userId,
            action,
            details,
            timestamp: new Date(),
            ipAddress
        });
        
        if (!auditLog) {
            throw new Error('Failed to create audit log');
        }
        
        return auditLog;
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Re-throw the error so it can be handled by the calling function
        throw new Error('Audit log creation failed: ' + error.message);
    }
};

// Get all offenses with role-based access
router.get('/', auth, async (req, res) => {
    try {
        console.log('User requesting offenses:', req.user);
        let query = {};

        // If user is a driver, only show their offenses
        if (req.user.role === 'driver') {
            query = { driverEmail: req.user.email };
        }
        // Officers, admins and superadmins can see all offenses
        else if (['officer', 'admin', 'superadmin'].includes(req.user.role)) {
            query = {};
        }

        console.log('Offense query:', query);

        const offenses = await Offense.find(query)
            .populate('driver', 'name email vehicleNumber')
            .sort({ date: -1 });

        console.log(`Found ${offenses.length} offenses`);
        res.json(offenses);
    } catch (error) {
        console.error('Error fetching offenses:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new offense (protected, only officers can create)
router.post('/', auth, checkRole(['officer', 'superadmin']), async (req, res) => {
    try {
        console.log('Creating new offense:', req.body);

        // Find the driver first
        const driver = await Driver.findOne({ vehicleNumber: req.body.vehicleNumber });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const offense = new Offense({
            driverName: driver.name,
            driverEmail: driver.email,
            vehicleNumber: req.body.vehicleNumber,
            offenceType: req.body.offenceType,
            location: req.body.location,
            fine: req.body.fine,
            date: req.body.date || new Date(),
            status: 'Unpaid',
            driver: driver._id,
            officerId: req.user.id,
            officerName: req.user.name
        });

        const savedOffense = await offense.save();
        console.log('Offense created successfully:', savedOffense);

        // Update driver's offense count
        driver.offences = (driver.offences || 0) + 1;
        await driver.save();

        // Create detailed audit log
        await createAuditLog(
            req.user._id,
            'OFFENSE_CREATED',
            {
                offenseId: savedOffense._id,
                offenseType: savedOffense.offenceType,
                driverEmail: savedOffense.driverEmail,
                location: savedOffense.location,
                fine: savedOffense.fine,
                createdBy: req.user.email,
                timestamp: new Date()
            },
            req.ip
        );

        res.status(201).json(savedOffense);
    } catch (error) {
        console.error('Error creating offense:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get driver-specific offenses
router.get('/driver/:email', auth, async (req, res) => {
    try {
        const { email } = req.params;
        
        // Ensure driver can only access their own offenses
        if (req.user.role === 'driver' && req.user.email !== email) {
            return res.status(403).json({ message: 'Not authorized to view these offenses' });
        }

        const offenses = await Offense.find({ driverEmail: email })
            .populate('driver')
            .sort({ date: -1 });

        res.json(offenses);
    } catch (error) {
        console.error('Error fetching driver offenses:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get offense statistics including monthly data and type distribution
router.get('/stats', auth, async (req, res) => {
    try {
        const query = {};
        
        // If user is a driver or driverEmail is provided, filter by driver
        if (req.user.role === 'driver' || req.query.driverEmail) {
            query.driverEmail = req.user.role === 'driver' ? req.user.email : req.query.driverEmail;
        }

        // Get total offenses
        const totalOffenses = await Offense.countDocuments(query);

        // Get monthly violations for the past 6 months
        const monthlyViolations = await Offense.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            },
            {
                $limit: 6
            }
        ]);

        // Get violation types distribution
        const violationTypes = await Offense.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: "$offenceType",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalOffenses,
            monthlyViolations,
            violationTypes
        });
    } catch (error) {
        console.error('Error getting offense stats:', error);
        res.status(500).json({ message: 'Failed to fetch offense stats' });
    }
});

// Get offense stats
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching stats...');
        
        // Get total offenses
        const offenses = await Offense.find({});
        console.log('All offenses:', offenses);
        const totalOffenses = offenses.length;
        console.log('Total offenses count:', totalOffenses);
        
        // Get new cases (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newCases = offenses.filter(offense => new Date(offense.date) >= sevenDaysAgo).length;
        console.log('New cases count:', newCases);
        
        // Calculate total fines
        const totalFines = offenses.reduce((sum, offense) => sum + (offense.fine || 0), 0);
        console.log('Total fines:', totalFines);
        
        // Get unique drivers
        const uniqueDrivers = [...new Set(offenses.map(offense => offense.vehicleNumber))];
        console.log('Unique drivers:', uniqueDrivers);
        
        const stats = {
            totalOffenses,
            newCases,
            activeUsers: uniqueDrivers.length,
            totalFines
        };
        
        console.log('Sending stats:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error getting stats:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get recent incidents
router.get('/recent', auth, async (req, res) => {
    try {
        const query = {};
        
        // If user is a driver or driverEmail is provided, filter by driver
        if (req.user.role === 'driver' || req.query.driverEmail) {
            query.driverEmail = req.user.role === 'driver' ? req.user.email : req.query.driverEmail;
        }

        const recentOffenses = await Offense.find(query)
            .sort({ date: -1 })
            .limit(5)
            .select('date offenceType location status');

        res.json(recentOffenses);
    } catch (error) {
        console.error('Error getting recent offenses:', error);
        res.status(500).json({ message: 'Failed to fetch recent offenses' });
    }
});

// Update offense status (protected)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const offense = await Offense.findById(id);

        if (!offense) {
            return res.status(404).json({ message: 'Offense not found' });
        }

        // Only allow officers/admin to update status
        if (req.user.role === 'driver') {
            return res.status(403).json({ message: 'Not authorized to update offense status' });
        }

        offense.status = req.body.status;
        const updatedOffense = await offense.save();

        // Update related payment status
        await Payment.findOneAndUpdate(
            { offense: offense._id },
            { 
                status: req.body.status === 'Paid' ? 'Completed' : 'Pending'
            }
        );

        // Create audit log
        await createAuditLog(
            req.user._id,
            'OFFENSE_STATUS_UPDATED',
            {
                offenseId: req.params.id,
                originalStatus: offense.status,
                newStatus: req.body.status
            },
            req.ip
        );

        res.json(updatedOffense);
    } catch (error) {
        console.error('Error updating offense:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update offense (now with audit trail)
router.put('/:id', auth, checkRole(['officer']), async (req, res) => {
    try {
        const offense = await Offense.findById(req.params.id);
        if (!offense) {
            return res.status(404).json({ message: 'Offense not found' });
        }

        // Store original data for audit
        const originalData = { ...offense._doc };

        // Create audit log
        await createAuditLog(
            req.user._id,
            'OFFENSE_UPDATED',
            {
                offenseId: req.params.id,
                originalData,
                newData: req.body
            },
            req.ip
        );

        // Update the offense
        const updatedOffense = await Offense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedOffense);
    } catch (error) {
        console.error('Error updating offense:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete offense (now requires approval)
router.delete('/:id', auth, checkRole(['officer']), async (req, res) => {
    try {
        const offense = await Offense.findById(req.params.id);
        if (!offense) {
            return res.status(404).json({ message: 'Offense not found' });
        }

        // Instead of deleting, mark for deletion and require superadmin approval
        offense.deletionRequested = true;
        offense.deletionRequestedBy = req.user._id;
        offense.deletionRequestReason = req.body.reason;
        await offense.save();

        // Create audit log
        await createAuditLog(
            req.user._id,
            'DELETION_REQUESTED',
            {
                offenseId: req.params.id,
                reason: req.body.reason,
                originalData: offense
            },
            req.ip
        );

        res.json({ message: 'Deletion request submitted for approval' });
    } catch (error) {
        console.error('Error requesting offense deletion:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reset offense data
router.post('/reset', async (req, res) => {
    try {
        // Delete existing offenses and payments
        await Offense.deleteMany({});
        await Payment.deleteMany({});
        
        // Get the drivers first
        const ilyas = await Driver.findOne({ name: "ilyas A. samadoon" });
        const yonis = await Driver.findOne({ name: "yonis ahmed" });
        
        if (!ilyas || !yonis) {
            return res.status(400).json({ message: 'Please reset drivers first' });
        }

        const sampleOffenses = [
            {
                driverName: "ilyas A. samadoon",
                vehicleNumber: "24354676",
                offenceType: "Speeding",
                location: "rtttr",
                fine: 4545,
                status: "Paid",
                date: new Date("2024-10-12"),
                driver: ilyas._id
            },
            {
                driverName: "ilyas A. samadoon",
                vehicleNumber: "24354676",
                offenceType: "Speeding",
                location: "hujhuj",
                fine: 7878,
                status: "Paid",
                date: new Date("2024-11-12"),
                driver: ilyas._id
            },
            {
                driverName: "ilyas A. samadoon",
                vehicleNumber: "24354676",
                offenceType: "Red Light",
                location: "jhujhj",
                fine: 887,
                status: "Paid",
                date: new Date("2024-11-12"),
                driver: ilyas._id
            },
            {
                driverName: "yonis ahmed",
                vehicleNumber: "23234",
                offenceType: "No License",
                location: "waberi",
                fine: 1000,
                status: "Paid",
                date: new Date("2024-11-12"),
                driver: yonis._id
            }
        ];

        const savedOffenses = await Offense.insertMany(sampleOffenses);

        // Create payments for each offense
        const payments = savedOffenses.map(offense => ({
            driverName: offense.driverName,
            vehicleNumber: offense.vehicleNumber,
            amount: offense.fine,
            paymentMethod: 'Cash',
            status: offense.status === 'Paid' ? 'Completed' : 'Pending',
            date: offense.date,
            offense: offense._id,
            driver: offense.driver
        }));

        await Payment.insertMany(payments);
        console.log('Payments created:', payments);

        res.json({ 
            message: 'Offense and payment data reset successfully', 
            offenses: savedOffenses 
        });
    } catch (err) {
        console.error('Error resetting offenses:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get all deletion requests (superadmin only)
router.get('/deletion-requests', auth, checkRole(['superadmin']), async (req, res) => {
    try {
        const requests = await DeletionRequest.find()
            .populate('requestedBy', 'name email')
            .populate('offenseId')
            .sort({ timestamp: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching deletion requests:', error);
        res.status(500).json({ message: 'Error fetching deletion requests' });
    }
});

// Create a deletion request
router.post('/deletion-requests', auth, async (req, res) => {
    try {
        const { offenseId, reason } = req.body;
        
        // Check if offense exists
        const offense = await Offense.findById(offenseId);
        if (!offense) {
            return res.status(404).json({ message: 'Offense not found' });
        }

        // Check if user is authorized (must be the driver of the offense, officer, admin, or superadmin)
        if (req.user.role !== 'superadmin' && 
            req.user.role !== 'admin' && 
            req.user.role !== 'officer' && 
            offense.driverEmail !== req.user.email) {
            return res.status(403).json({ message: 'Not authorized to request deletion' });
        }

        // Create deletion request
        const request = await DeletionRequest.create({
            offenseId,
            requestedBy: req.user._id,
            reason,
            status: 'pending',
            timestamp: new Date(),
            originalOffense: {
                driverName: offense.driverName,
                vehicleNumber: offense.vehicleNumber,
                offenceType: offense.offenceType,
                location: offense.location,
                date: offense.date,
                fine: offense.fine
            }
        });

        // Create audit log
        await createAuditLog(req.user._id, 'CREATE_DELETION_REQUEST', {
            requestId: request._id,
            offenseId: offense._id
        }, req.ip);

        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating deletion request:', error);
        res.status(500).json({ message: 'Error creating deletion request' });
    }
});

// Update deletion request status (superadmin only)
router.patch('/deletion-requests/:id', auth, checkRole(['superadmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await DeletionRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Deletion request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        request.status = status;
        await request.save();

        // If approved, delete the offense
        if (status === 'approved') {
            await Offense.findByIdAndDelete(request.offenseId);
        }

        // Create audit log
        await createAuditLog(req.user._id, `${status.toUpperCase()}_DELETION_REQUEST`, {
            requestId: request._id,
            offenseId: request.offenseId
        }, req.ip);

        res.json(request);
    } catch (error) {
        console.error('Error updating deletion request:', error);
        res.status(500).json({ message: 'Error updating deletion request' });
    }
});

// Migration: Update existing offenses to use offenseType instead of offense
const migrateOffenses = async () => {
    try {
        const offenses = await Offense.find({});
        for (const offense of offenses) {
            if (offense.offense && !offense.offenseType) {
                offense.offenseType = offense.offense;
                offense.offense = undefined;
                await offense.save();
            }
        }
        console.log('Successfully migrated offenses to use offenseType');
    } catch (error) {
        console.error('Error migrating offenses:', error);
    }
};

// Run migration when server starts
migrateOffenses();

module.exports = router;
