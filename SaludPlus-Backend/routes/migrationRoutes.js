const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { migrateData } = require("../controllers/migrationController");

// Aquí definimos la sub-ruta
router.post("/migrate", upload.single("file"), migrateData);

module.exports = router;