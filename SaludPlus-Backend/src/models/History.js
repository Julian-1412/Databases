const mongoose = require('mongoose');

const PatientHistorySchema = new mongoose.Schema({
    patientEmail: { type: String, unique: true },
    patientName: String,
    appointments: [{
        appointmentId: String,
        date: String,
        doctorName: String,
        specialty: String,
        treatmentDescription: String,
        amountPaid: Number
    }]
});

module.exports = mongoose.model('PatientHistory', PatientHistorySchema);