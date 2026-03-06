const router = require("express").Router();
const { getRevenueReport } = require("../controllers/reportController");
router.get("/revenue", getRevenueReport);
module.exports = router;