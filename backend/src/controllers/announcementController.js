const Announcement = require("../models/Announcement");

const createAnnouncement = async (req, res) => {
  try {
    const { title, body, category } = req.body;
    const announcement = await Announcement.create({
      title,
      body,
      category,
      department: req.user.department, // staff can only post to their own department
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({
        message:
          "Your account is missing a department. Please contact support.",
      });
    }

    let filter;
    if (req.user.role === "student") {
      // students see their own department's posts PLUS Registrar's (school-wide announcements)
      filter = { department: { $in: [req.user.department, "Registrar"] } };
    } else {
      // admins manage only their own department's announcements
      filter = { department: req.user.department };
    }

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "postedBy",
      "name role",
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (announcement.department !== req.user.department) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (announcement.department !== req.user.department) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your department's announcement" });
    }

    const { title, body, category } = req.body; // department intentionally excluded from updates too
    announcement.title = title ?? announcement.title;
    announcement.body = body ?? announcement.body;
    announcement.category = category ?? announcement.category;
    await announcement.save();

    res.json(announcement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (announcement.department !== req.user.department) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your department's announcement" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
