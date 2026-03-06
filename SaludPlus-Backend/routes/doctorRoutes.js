const router = require("express").Router();
const doctorController = require("../controllers/doctorController");
router.get("/", doctorController.getDoctors);
router.get("/:id", doctorController.getDoctorById);
router.put("/:id", doctorController.updateDoctor);
module.exports = router;