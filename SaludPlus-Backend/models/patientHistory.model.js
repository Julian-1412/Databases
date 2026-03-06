const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  appointmentId: String,
  date: String,
  doctorName: String,
  specialty: String,
  treatmentDescription: String,
  amountPaid: Number
});

const patientHistorySchema = new mongoose.Schema({
  patientEmail: {
    type: String,
    required: true,
    unique: true
  },
  patientName: String,
  appointments: [appointmentSchema]
});

module.exports = mongoose.model("PatientHistory", patientHistorySchema);