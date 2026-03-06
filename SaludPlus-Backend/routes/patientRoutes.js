const router = require("express").Router();
const PatientHistory = require("../models/patientHistory.model");
router.get("/:email/history", async (req, res) => {
  try {
    const history = await PatientHistory.findOne({ patientEmail: req.params.email });
    res.json(history || { message: "Sin historial" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;