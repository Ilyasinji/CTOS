const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TrafficOffence = require('../models/TrafficOffence');
const Payment = require('../models/Payment');

// Get Violations Statistics
router.get('/violations/stats', auth, async (req, res) => {
  try {
    // Get total violations
    const total = await TrafficOffence.countDocuments();

    // Get monthly violations for the last 6 months
    const monthly = await TrafficOffence.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 6
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get violations by type
    const byType = await TrafficOffence.aggregate([
      {
        $group: {
          _id: '$offenceType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      total,
      monthly,
      byType
    });
  } catch (error) {
    console.error('Error fetching violation stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Revenue Statistics
router.get('/revenue/stats', auth, async (req, res) => {
  try {
    // Get total revenue
    const totalResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const total = totalResult[0]?.total || 0;

    // Get monthly revenue for the last 6 months
    const monthly = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 6
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          amount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      total,
      monthly
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Incidents Statistics
router.get('/incidents/stats', auth, async (req, res) => {
  try {
    // For now, returning mock data since incidents might be handled differently
    // Modify this based on your actual incident tracking implementation
    res.json({
      total: 0,
      monthly: [],
      recent: []
    });
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
