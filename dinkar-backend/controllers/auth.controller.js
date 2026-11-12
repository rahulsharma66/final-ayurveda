const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const ADMIN_RECOVERY_EMAIL = (
  process.env.ADMIN_RECOVERY_EMAIL || "rsharma24102006@gmail.com"
).toLowerCase();

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

const getRecoveryAdmin = () =>
  User.findOne({ role: "admin", recoveryEmail: ADMIN_RECOVERY_EMAIL });

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const error = new Error("EMAIL_NOT_CONFIGURED");
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: { user, pass },
  });
};

const sendOtpEmail = async (otp) => {
  const transporter = createTransporter();
  const smtpUser = process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Dinkar Ayurveda Admin" <${smtpUser}>`,
    to: ADMIN_RECOVERY_EMAIL,
    subject: "Admin credentials reset OTP",
    text: `Your admin reset OTP is ${otp}. It is valid for 10 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2f6b3a;">Dinkar Ayurveda Admin</h2>
        <p>Your admin credentials reset OTP is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
        <p>This code is valid for 10 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

/**
 * LOGIN (ADMIN ONLY USE)
 * Customers now check out entirely on Meesho, so login exists
 * purely to secure the admin panel.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (
      user &&
      user.role === "admin" &&
      (user.email === ADMIN_RECOVERY_EMAIL ||
        user.recoveryEmail === ADMIN_RECOVERY_EMAIL)
    ) {
      let changed = false;
      if (user.recoveryEmail !== ADMIN_RECOVERY_EMAIL) {
        user.recoveryEmail = ADMIN_RECOVERY_EMAIL;
        changed = true;
      }
      if (user.isActive !== true) {
        user.isActive = true;
        changed = true;
      }
      if (changed) await user.save();
    }

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Admin account is inactive" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * REQUEST RESET OTP
 * Only the fixed recovery email can request a reset.
 */
exports.requestReset = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (email !== ADMIN_RECOVERY_EMAIL) {
      return res.status(403).json({
        message: "Only the fixed recovery email can reset admin credentials",
      });
    }

    const admin = await getRecoveryAdmin();
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    if (
      admin.resetOtpRequestedAt &&
      Date.now() - new Date(admin.resetOtpRequestedAt).getTime() < OTP_COOLDOWN_MS
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    admin.resetOtp = await bcrypt.hash(otp, 10);
    admin.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    admin.resetOtpRequestedAt = new Date();
    await admin.save();

    try {
      await sendOtpEmail(otp);
    } catch (error) {
      admin.resetOtp = "";
      admin.resetOtpExpires = undefined;
      admin.resetOtpRequestedAt = undefined;
      await admin.save();

      if (error.code === "EMAIL_NOT_CONFIGURED") {
        return res.status(503).json({
          message:
            "Email service is not configured. Add SMTP_PASS to the backend .env file.",
        });
      }

      console.error("Failed to send reset OTP email:", error);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "OTP sent to the recovery email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * RESET ADMIN EMAIL AND/OR PASSWORD
 * Requires the OTP sent to the fixed recovery email.
 */
exports.resetCredentials = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    const newEmail = String(req.body.newEmail || "").trim().toLowerCase();
    const newPassword = String(req.body.newPassword || "");

    if (email !== ADMIN_RECOVERY_EMAIL) {
      return res.status(403).json({
        message: "Only the fixed recovery email can reset admin credentials",
      });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    if (!newEmail && !newPassword) {
      return res.status(400).json({
        message: "Enter a new email or a new password",
      });
    }

    if (newPassword && newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const admin = await getRecoveryAdmin();
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    if (
      !admin.resetOtp ||
      !admin.resetOtpExpires ||
      new Date(admin.resetOtpExpires).getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    const otpMatches = await bcrypt.compare(otp, admin.resetOtp);
    if (!otpMatches) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (newEmail && newEmail !== admin.email) {
      const existingUser = await User.findOne({
        email: newEmail,
        _id: { $ne: admin._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "This email is already in use",
        });
      }

      admin.email = newEmail;
      admin.isEmailVerified = true;
    }

    if (newPassword) {
      admin.password = newPassword;
    }

    admin.resetOtp = "";
    admin.resetOtpExpires = undefined;
    admin.resetOtpRequestedAt = undefined;
    await admin.save();

    res.json({
      message: "Admin credentials updated successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
