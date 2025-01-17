const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  offense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offense',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverEmail: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Mobile Money'],
    default: 'Cash'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add static method to calculate totals
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        totalCollections: [
          { $match: { status: 'Completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        todaysPayments: [
          { 
            $match: { 
              status: 'Completed',
              date: { 
                $gte: new Date(new Date().setHours(0,0,0,0)),
                $lt: new Date(new Date().setHours(23,59,59,999))
              }
            }
          },
          { $count: 'count' }
        ],
        pendingPayments: [
          { $match: { status: 'Pending' } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    totalCollections: stats[0].totalCollections[0]?.total || 0,
    todaysPayments: stats[0].todaysPayments[0]?.count || 0,
    pendingPayments: stats[0].pendingPayments[0]?.count || 0
  };
};

// Add index for faster queries
paymentSchema.index({ driverEmail: 1 });
paymentSchema.index({ 'driver.email': 1 });

module.exports = mongoose.model('Payment', paymentSchema);