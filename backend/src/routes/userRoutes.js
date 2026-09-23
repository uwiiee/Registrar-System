const express = require("express");
const router = express.Router();
const { getStudents } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/students", protect, authorize("admin"), getStudents);

module.exports = router;
