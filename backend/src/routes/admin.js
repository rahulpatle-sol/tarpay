/**
 * Admin Routes — /api/admin
 * Protected endpoints for dispute resolution, user management, and engine monitoring.
 * Requires isAdmin: true in the JWT payload.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAdmin } = require("../middleware/auth");
const engine           = require("../../../contract/src/engine");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/disputes/:id/resolve
router.post("/disputes/:id/resolve", requireAdmin, async (req, res) => {
  try {
    const { resolution } = req.body; // "REVERT" or "SETTLE"
    const result = await engine.resolveDispute({
      transactionId: req.params.id,
      resolution,
      resolvedBy: `Admin:${req.user.id}`,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/admin/disputes — all open disputes
router.get("/disputes", requireAdmin, async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "asc" },
      include: {
        transaction: { include: { sender: { select: { name: true, upiId: true } }, receiver: { select: { name: true, upiId: true } } } },
        raisedBy: { select: { name: true, upiId: true } },
      },
    });
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/block — block a user account
router.put("/users/:id/block", requireAdmin, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked: true } });
    res.json({ success: true, message: "User account blocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/unblock
router.put("/users/:id/unblock", requireAdmin, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked: false } });
    res.json({ success: true, message: "User account unblocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/flagged — flagged transactions needing manual review
router.get("/flagged", requireAdmin, async (req, res) => {
  try {
    const flagged = await prisma.transaction.findMany({
      where: { status: "FLAGGED" },
      orderBy: { createdAt: "desc" },
      include: {
        sender:   { select: { name: true, upiId: true, fraudScore: true } },
        receiver: { select: { name: true, upiId: true, fraudScore: true } },
      },
    });
    res.json({ success: true, flagged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/settle — manually trigger auto-settle (useful for testing)
router.post("/settle", requireAdmin, async (req, res) => {
  try {
    const result = await engine.autoSettle();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
