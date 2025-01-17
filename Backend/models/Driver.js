const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String },
  offences: { type: Number, default: 0 },
  status: { type: String, default: 'active' }
}, {
  timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;