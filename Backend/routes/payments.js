const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Offense = require('../models/Offense');
const User = require('../models/User'); // Assuming User model is defined in '../models/User'
const { auth, checkRole } = require('../middleware/auth');

// Get payment statistics including monthly revenue
router.get('/stats', auth, async (req, res) => {
  try {
    const query = {};
    
    // If user is a driver or driverEmail is provided, filter by driver
    if (req.user.role === 'driver' || req.query.driverEmail) {
      query.driverEmail = req.user.role === 'driver' ? req.user.email : req.query.driverEmail;
    }

    // Get total collections and monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      },
      {
        $limit: 6
      }
    ]);

    // Get total collections
    const totalCollections = await Payment.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      totalCollections: totalCollections[0]?.total || 0,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({ message: 'Failed to fetch payment stats' });
  }
});

// Get all payments
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching payments for user:', req.user);
        let query = {};

        // If user is driver, only show their payments
        if (req.user.role === 'driver') {
            query = { driverEmail: req.user.email };
            console.log('Driver-specific query:', query);
        }

        const payments = await Payment.find(query)
            .populate('offense')
            .populate('driver')
            .sort({ date: -1 });

        console.log('Found payments:', payments.length);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get driver-specific payments
router.get('/driver/:email', auth, async (req, res) => {
    try {
        const { email } = req.params;
        console.log('Fetching payments for driver email:', email);

        // Ensure user can only access their own payments
        if (req.user.role === 'driver' && req.user.email !== email) {
            return res.status(403).json({ message: 'Not authorized to view these payments' });
        }

        // First check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all payments for this driver using driverEmail field
        const payments = await Payment.find({ driverEmail: email })
            .populate('offense')
            .populate('driver')
            .sort({ date: -1 });

        console.log('Found driver-specific payments:', {
            email,
            count: payments.length,
            payments: payments.map(p => ({
                id: p._id,
                amount: p.amount,
                date: p.date,
                status: p.status
            }))
        });

        // Calculate payment stats for the driver
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get unpaid offenses count
        const unpaidOffenses = await Offense.countDocuments({
            driverEmail: email,
            status: 'Unpaid'
        });

        const stats = {
            totalCollections: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
            todayPayments: payments.filter(p => {
                const paymentDate = new Date(p.date);
                paymentDate.setHours(0, 0, 0, 0);
                return paymentDate.getTime() === today.getTime();
            }).length,
            pendingPayments: unpaidOffenses
        };

        console.log('Calculated stats:', stats);

        // Even if no payments found, return empty array with zero stats
        res.json({
            payments: payments || [],
            stats: stats
        });

    } catch (error) {
        console.error('Error fetching driver payments:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new payment
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const userRole = req.user.role;

    // Check payment method authorization
    if ((userRole === 'admin' || userRole === 'police') && paymentMethod !== 'Cash') {
      return res.status(403).json({
        message: 'Admin and police officers can only process cash payments'
      });
    }

    if (userRole === 'driver' && paymentMethod === 'Cash') {
      return res.status(403).json({
        message: 'Drivers can only use Mobile Money or Card payments'
      });
    }

    // Validate mobile money details if needed
    if (paymentMethod === 'Mobile Money') {
      const { mobileDetails } = req.body;
      if (!mobileDetails || !mobileDetails.provider || !mobileDetails.number) {
        return res.status(400).json({
          message: 'Mobile money payments require provider and phone number'
        });
      }
    }

    const payment = new Payment({
      ...req.body,
      status: 'Completed',
      createdBy: req.user._id
    });

    await payment.save();

    // Update offense status
    await Offense.findByIdAndUpdate(req.body.offense, {
      status: 'Paid',
      paymentId: payment._id
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ message: 'Failed to create payment' });
  }
});

// Get driver's payments
router.get('/driver/payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ driverEmail: req.user.email })
      .populate('offense')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's pending payments
router.get('/driver/pending', auth, async (req, res) => {
  try {
    const pendingOffenses = await Offense.find({
      driverEmail: req.user.email,
      status: 'Unpaid'
    }).populate('offense_type');
    res.json(pendingOffenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make a payment
router.post('/driver/pay', auth, async (req, res) => {
  try {
    const { offenseId, amount } = req.body;
    
    const offense = await Offense.findOne({ 
      _id: offenseId,
      driverEmail: req.user.email,
      status: 'unpaid'
    });

    if (!offense) {
      return res.status(404).json({ message: 'Offense not found or already paid' });
    }

    const payment = await Payment.create({
      offense: offenseId,
      driverEmail: req.user.email,
      amount: amount,
      date: new Date()
    });

    offense.status = 'paid';
    await offense.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ... other routes ...

module.exports = router; 