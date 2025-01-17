const express = require('express');
const router = express.Router();
const Offense = require('../models/Offense');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get all data
    const [offenses, drivers, payments] = await Promise.all([
      Offense.find({}),
      Driver.find({}),
      Payment.find({})
    ]);
    
    // Calculate stats
    const totalOffences = offenses.length;
    
    // Recent offences (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOffences = offenses.filter(offense => 
      new Date(offense.date) >= sevenDaysAgo
    ).length;
    
    // Active drivers
    const activeDrivers = drivers.length;
    
    // Drivers with offences
    const driversWithOffences = drivers.filter(d => d.offences > 0).length;
    
    // Total fines
    const totalFines = offenses.reduce((sum, offense) => sum + (offense.fine || 0), 0);
    
    // Paid and unpaid fines
    const paidFines = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const unpaidFines = totalFines - paidFines;
    
    const stats = {
      totalOffences,
      recentOffences,
      activeDrivers,
      driversWithOffences,
      totalFines,
      paidFines,
      unpaidFines
    };
    
    console.log('Dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
