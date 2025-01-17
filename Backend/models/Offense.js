const mongoose = require('mongoose');

const offenseSchema = new mongoose.Schema({
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
  offenceType: {
    type: String,
    required: true,
    enum: ['Speeding', 'Parking', 'No License', 'Red Light', 'Drunk Driving', 'Other', 'Dhigashada Khaldan']
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  fine: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Unpaid'],
    default: 'Unpaid'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Offense', offenseSchema);
