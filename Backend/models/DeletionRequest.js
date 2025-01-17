const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
    offenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offense',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    originalOffense: {
        driverName: String,
        vehicleNumber: String,
        offenceType: String,
        location: String,
        date: String,
        fine: Number
    }
});

// Add indexes
deletionRequestSchema.index({ status: 1 });
deletionRequestSchema.index({ timestamp: -1 });

module.exports = mongoose.model('DeletionRequest', deletionRequestSchema);
