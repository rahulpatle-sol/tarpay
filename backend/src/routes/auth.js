/**
 * Auth Routes — /api/auth
 * Handles user registration and login.
 * On register, every user gets ₹10,000 simulated TarPay credits.
 */

const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, phone, upiId, password, isMerchant, businessName } = req.body;

    if (!name || !phone || !upiId || !password) {
      return res.status(400).json({ success: false, message: "name, phone, upiId, password are required" });
    }

    // Ensure UPI ID follows the format: anything@tarpay
    if (!upiId.endsWith("@tarpay")) {
      return res.status(400).json({ success: false, message: "UPI ID must end with @tarpay (e.g. rahul@tarpay)" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ upiId }, { phone }] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Phone or UPI ID already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, phone, upiId, passwordHash, isMerchant: !!isMerchant, businessName: businessName || null },
    });

    // Drop password hash from response
    const { passwordHash: _, ...safeUser } = user;

    res.status(201).json({ success: true, message: "Account created! You have ₹10,000 TarPay credits.", user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { upiId, password } = req.body;
    if (!upiId || !password) {
      return res.status(400).json({ success: false, message: "upiId and password required" });
    }

    const user = await prisma.user.findUnique({ where: { upiId } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (user.isBlocked) return res.status(403).json({ success: false, message: "Account suspended" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, upiId: user.upiId, isMerchant: user.isMerchant, isAdmin: true },
      process.env.JWT_SECRET,

      { expiresIn: "7d" }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
