const User = require("../models/User");

const ADMIN_RECOVERY_EMAIL = (
  process.env.ADMIN_RECOVERY_EMAIL || "rsharma24102006@gmail.com"
).toLowerCase();

const isPrimaryAdmin = (user) =>
  String(user.recoveryEmail || "").toLowerCase() === ADMIN_RECOVERY_EMAIL;

const serializeUser = (user, currentUserId) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive === true,
  isEmailVerified: user.isEmailVerified === true,
  isPrimary: isPrimaryAdmin(user),
  isSelf: String(user._id) === String(currentUserId),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "admin" }).sort({ createdAt: 1 });
    const sorted = users.sort((a, b) => {
      if (isPrimaryAdmin(a)) return -1;
      if (isPrimaryAdmin(b)) return 1;
      return 0;
    });

    res.json(sorted.map((user) => serializeUser(user, req.user._id)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch admin users" });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const isActive = req.body.isActive !== false;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      isEmailVerified: true,
      isActive,
    });

    res.status(201).json(serializeUser(user, req.user._id));
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create admin user" });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const primary = isPrimaryAdmin(user);
    const isSelf = String(user._id) === String(req.user._id);
    const name =
      req.body.name !== undefined ? String(req.body.name).trim() : user.name;
    const email =
      req.body.email !== undefined
        ? String(req.body.email).trim().toLowerCase()
        : user.email;
    const password =
      req.body.password !== undefined ? String(req.body.password) : "";
    const isActive =
      req.body.isActive !== undefined
        ? req.body.isActive !== false
        : user.isActive !== false;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if ((primary || isSelf) && !isActive) {
      return res.status(400).json({
        message: primary
          ? "Primary admin cannot be deactivated"
          : "You cannot deactivate your own account",
      });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "This email is already in use" });
      }

      user.email = email;
      user.isEmailVerified = true;
    }

    user.name = name;
    user.isActive = isActive;
    if (password) user.password = password;
    await user.save();

    res.json(serializeUser(user, req.user._id));
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update admin user" });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin user not found" });
    }

    if (isPrimaryAdmin(user)) {
      return res
        .status(400)
        .json({ message: "Primary admin cannot be deleted" });
    }

    if (String(user._id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ message: "Admin user deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete admin user" });
  }
};
