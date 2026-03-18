/**
 * Transaction Routes — /api/transactions
 * All payment operations go through the TarPay Contract Engine.
 * This layer is intentionally thin — business logic lives in the engine.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth }  = require("../middleware/auth");
const engine           = require("../../../contract/src/engine");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/transactions/send
// Initiates a payment — validates receiver, locks funds in escrow
router.post("/send", requireAuth, async (req, res) => {
  try {
    const { receiverUpiId, amount, description } = req.body;
    if (!receiverUpiId || !amount) {
      return res.status(400).json({ success: false, message: "receiverUpiId and amount are required" });
    }

    const result = await engine.initiateTransaction({
      senderId: req.user.id,
      receiverUpiId,
      amount: parseFloat(amount),
      description,
      ipAddress: req.clientIp,
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/validate/:upiId
// Pre-flight check before sending — frontend calls this to show receiver info
router.get("/validate/:upiId", requireAuth, async (req, res) => {
  try {
    const result = await engine.validateReceiver(req.params.upiId);
    if (!result.valid) {
      return res.status(404).json({ success: false, message: result.reason });
    }
    const { passwordHash: _, ...safeUser } = result.user;
    res.json({ success: true, receiver: safeUser, warning: result.warning || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/transactions/:id/cancel
// Cancel within 1-hour window — instant refund
router.post("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const result = await engine.cancelTransaction({
      transactionId: req.params.id,
      requesterId: req.user.id,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/history
// Full transaction history for the authenticated user
router.get("/history", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      ...(status && { status }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
        include: {
          sender:   { select: { name: true, upiId: true } },
          receiver: { select: { name: true, upiId: true } },
          escrow:   { select: { status: true, releaseAt: true } },
          dispute:  { select: { status: true, reason: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ success: true, transactions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/:id
// Single transaction detail with full audit log
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        sender:   { select: { name: true, upiId: true } },
        receiver: { select: { name: true, upiId: true } },
        escrow:   true,
        dispute:  true,
        logs:     { orderBy: { createdAt: "asc" } },
      },
    });

    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });

    // Only sender or receiver can view the transaction
    if (tx.senderId !== req.user.id && tx.receiverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
