/**
 * User Routes — /api/users
 * Profile, balance, notifications, and merchant dashboard stats.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth }  = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me — current user profile + balance
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, phone: true, upiId: true, isMerchant: true, businessName: true, balance: true, fraudScore: true, createdAt: true },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/notifications
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/notifications/read — mark all as read
router.put("/notifications/read", requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/dashboard — merchant analytics summary
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [received, sent, pending, disputes] = await Promise.all([
      // Total settled receipts
      prisma.transaction.aggregate({
        where: { receiverId: userId, status: "SETTLED" },
        _sum: { amount: true }, _count: true,
      }),
      // Total sent (all statuses)
      prisma.transaction.aggregate({
        where: { senderId: userId },
        _sum: { amount: true }, _count: true,
      }),
      // Currently on hold (incoming)
      prisma.transaction.aggregate({
        where: { receiverId: userId, status: "ON_HOLD" },
        _sum: { amount: true }, _count: true,
      }),
      // Open disputes
      prisma.dispute.count({ where: { raisedById: userId, status: "OPEN" } }),
    ]);

    // Recent 5 transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender:   { select: { name: true, upiId: true } },
        receiver: { select: { name: true, upiId: true } },
      },
    });

    res.json({
      success: true,
      stats: {
        totalReceived: { amount: received._sum.amount || 0, count: received._count },
        totalSent:     { amount: sent._sum.amount || 0,     count: sent._count },
        pendingEscrow: { amount: pending._sum.amount || 0,  count: pending._count },
        openDisputes: disputes,
      },
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
