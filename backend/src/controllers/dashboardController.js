const Appointment = require("../models/Appointment");
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { sortQueue, buildQueueView } = require("../utils/queueEngine");

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.department === "Registrar") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const waitingAppointments = await Appointment.find({
        status: { $in: ["pending", "queued"] },
      })
        .populate("student", "name studentId")
        .populate("service", "name avgDurationMins");

      const currentlyServing = await Appointment.countDocuments({
        status: "serving",
      });

      const todaysAppointments = await Appointment.countDocuments({
        preferredDate: { $gte: startOfDay, $lte: endOfDay },
      });

      const completedToday = await Appointment.countDocuments({
        status: "done",
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const queuePreview = buildQueueView(sortQueue(waitingAppointments)).slice(
        0,
        5,
      );

      const latestAnnouncement = await Announcement.findOne({
        department: "Registrar",
      })
        .sort({ createdAt: -1 })
        .populate("postedBy", "name");

      return res.json({
        type: "registrar",
        totalWaiting: waitingAppointments.length,
        currentlyServing,
        todaysAppointments,
        completedToday,
        queuePreview,
        latestAnnouncement,
      });
    }

    // course admin
    const studentCount = await User.countDocuments({
      role: "student",
      department: req.user.department,
    });
    const announcementCount = await Announcement.countDocuments({
      department: req.user.department,
    });
    const recentAnnouncements = await Announcement.find({
      department: req.user.department,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("postedBy", "name");

    res.json({
      type: "course",
      studentCount,
      announcementCount,
      recentAnnouncements,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
