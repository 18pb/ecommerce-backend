const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Model mapping

// 📝 ROUTE 1: REGISTRATION (Public signup — always creates a standard User)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All input fields are mandatory" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    // Security: public registration can NEVER create an admin account,
    // regardless of what the client sends in the request body.
    // Admins are provisioned manually (e.g. directly in the database).
    const user = new User({
      name,
      email: cleanEmail,
      password,
      role: "user",
    });

    await user.save();
    return res.status(201).json({
      message: "Account created successfully! Please login.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// 🔑 ROUTE 2: LOGIN (Reads credentials and responds back with specific structural roles)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    // Creating safe JWT Authorization access payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "ecommerce_secret_key_123",
      { expiresIn: "1d" },
    );

    // Returning token along with matching identity role directly back to our interactive UI
    return res.status(200).json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server login operation broken", error: error.message });
  }
});

module.exports = router;
