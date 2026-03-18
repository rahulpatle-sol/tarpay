/**
 * Dispute Routes — /api/disputes
 * Raise and track disputes on held transactions.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth }  = require("../middleware/auth");
const engine           = require("../../../contract/src/engine");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/disputes/raise
router.post("/raise", requireAuth, async (req, res) => {
  try {
    const { transactionId, reason, description } = req.body;
    if (!transactionId || !reason) {
      return res.status(400).json({ success: false, message: "transactionId and reason are required" });
    }

    const result = await engine.raiseDispute({
      transactionId,
      raisedById: req.user.id,
      reason,
      description,
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/disputes/my
// All disputes raised by the authenticated user
router.get("/my", requireAuth, async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { raisedById: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        transaction: {
          include: {
            receiver: { select: { name: true, upiId: true } },
          },
        },
      },
    });
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/disputes/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });
    if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
