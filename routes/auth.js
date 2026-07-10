const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Model mapping

// 📝 ROUTE 1: REGISTRATION (Handles both Users and Admins dynamic logic)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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

    // Role dynamic fallback rules: Agar explicit frontend se user role nahi aaya toh default 'user'
    const user = new User({
      name,
      email: cleanEmail,
      password,
      role: role || "user",
    });

    await user.save();
    return res
      .status(201)
      .json({
        message: `Account verified and built successfully as ${user.role.toUpperCase()}!`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
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
