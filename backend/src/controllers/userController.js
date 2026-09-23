const User = require("../models/User");

const getStudents = async (req, res) => {
  try {
    const filter = { role: "student" };

    // Registrar oversees everyone; course admins see only their own department
    if (req.user.department !== "Registrar") {
      filter.department = req.user.department;
    }

    const students = await User.find(filter)
      .select("-password")
      .sort({ name: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents };
