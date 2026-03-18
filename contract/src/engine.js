/**
 * =============================================================================
 * TarPay Contract Engine
 * =============================================================================
 * This is the core of TarPay. Inspired by DeFi smart contract principles
 * but implemented as a deterministic rule engine on our own infrastructure.
 *
 * Philosophy:
 *   - Every rule is explicit and auditable (like on-chain code)
 *   - State transitions are logged immutably (like blockchain events)
 *   - No money moves without passing through this engine
 *   - Engine decisions are deterministic — same input = same output always
 *
 * Flow:
 *   validate() → lock() → [dispute() | cancel() | autoSettle()] → settle() | revert()
 * =============================================================================
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =============================================================================
// CONSTANTS — tune these to change engine behavior
// =============================================================================

const HOLD_DURATION_SECONDS = 24 * 60 * 60; // 24 hours default escrow window
const CANCEL_WINDOW_SECONDS = 60 * 60;       // 1 hour — sender can hard-cancel
const MAX_SINGLE_TX_AMOUNT  = 100000;         // ₹1,00,000 — flag if exceeded
const FRAUD_SCORE_THRESHOLD = 70;             // above this = auto-flag tx
const HIGH_RISK_AMOUNT      = 50000;          // ₹50,000+ = elevated risk score

// =============================================================================
// HELPER — append an immutable log entry for every state change.
// This is our "blockchain event" — append-only audit trail.
// =============================================================================

async function _logTransition(prismaClient, transactionId, fromStatus, toStatus, triggeredBy, note = null) {
  await prismaClient.transactionLog.create({
    data: { transactionId, fromStatus, toStatus, triggeredBy, note },
  });
}

// =============================================================================
// HELPER — send an in-app notification to a user.
// =============================================================================

async function _notify(prismaClient, userId, title, body) {
  await prismaClient.notification.create({
    data: { userId, title, body },
  });
}

// =============================================================================
// RULE: validateReceiver
// Before any money moves, we validate that the receiver UPI ID is:
//   1. Registered on TarPay
//   2. Not blocked by admin
//   3. Not flagged for excessive fraud
//
// Returns: { valid: boolean, user: User|null, reason: string|null }
// =============================================================================

async function validateReceiver(receiverUpiId) {
  const receiver = await prisma.user.findUnique({
    where: { upiId: receiverUpiId },
  });

  if (!receiver) {
    return { valid: false, user: null, reason: "UPI ID not registered on TarPay" };
  }

  if (receiver.isBlocked) {
    return { valid: false, user: null, reason: "This account has been suspended" };
  }

  // High fraud score is a warning, not a hard block — we inform the sender
  const warning = receiver.fraudScore >= 50
    ? `Warning: This account has a high fraud score (${receiver.fraudScore}/100)`
    : null;

  return { valid: true, user: receiver, reason: null, warning };
}

// =============================================================================
// RULE: assessRisk
// Scores a transaction 0-100 based on multiple signals.
// Higher score = higher risk. Above FRAUD_SCORE_THRESHOLD = auto-flag.
//
// This is TarPay's lightweight fraud detection layer.
// =============================================================================

function assessRisk({ amount, sender, receiver, isFirstTimeBetweenPair }) {
  let score = 0;

  // Large amounts are inherently higher risk
  if (amount >= HIGH_RISK_AMOUNT) score += 30;
  else if (amount >= 10000) score += 15;

  // Sender's overall fraud history
  if (sender.fraudScore >= 50) score += 20;

  // Receiver's fraud history — most critical signal
  if (receiver.fraudScore >= 70) score += 40;
  else if (receiver.fraudScore >= 40) score += 20;

  // First-time payment between these two users — slightly higher risk
  if (isFirstTimeBetweenPair) score += 10;

  // Cap at 100
  return Math.min(score, 100);
}

// =============================================================================
// CONTRACT: initiateTransaction
// Entry point for all payments. Validates, scores, creates the transaction,
// deducts from sender balance, and locks funds in escrow.
//
// This is equivalent to calling a smart contract's deposit() function.
// =============================================================================

async function initiateTransaction({ senderId, receiverUpiId, amount, description, ipAddress }) {
  // --- Step 1: Fetch sender ---
  const sender = await prisma.user.findUnique({ where: { id: senderId } });
  if (!sender) throw new Error("Sender not found");
  if (sender.isBlocked) throw new Error("Your account is suspended");
  if (sender.balance < amount) throw new Error("Insufficient TarPay balance");
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  if (amount > MAX_SINGLE_TX_AMOUNT) throw new Error(`Single transaction limit is ₹${MAX_SINGLE_TX_AMOUNT}`);

  // --- Step 2: Validate receiver ---
  const validation = await validateReceiver(receiverUpiId);
  if (!validation.valid) throw new Error(validation.reason);
  const receiver = validation.user;

  // Prevent self-payment
  if (receiver.id === senderId) throw new Error("Cannot send money to yourself");

  // --- Step 3: Check if this is the first tx between sender and receiver ---
  const priorTx = await prisma.transaction.findFirst({
    where: { senderId, receiverId: receiver.id, status: "SETTLED" },
  });
  const isFirstTimeBetweenPair = !priorTx;

  // --- Step 4: Assess fraud risk ---
  const riskScore = assessRisk({ amount, sender, receiver, isFirstTimeBetweenPair });
  const isFlagged = riskScore >= FRAUD_SCORE_THRESHOLD;

  // --- Step 5: Calculate escrow window ---
  const now = new Date();
  const releaseAt = new Date(now.getTime() + HOLD_DURATION_SECONDS * 1000);

  // --- Step 6: Create transaction + escrow + deduct balance atomically ---
  // We use a Prisma transaction to ensure all-or-nothing execution.
  // If any step fails, the entire operation rolls back — no partial state.
  const result = await prisma.$transaction(async (tx) => {
    // Deduct from sender balance (funds are now "in escrow")
    await tx.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });

    // Create the transaction record
    const transaction = await tx.transaction.create({
      data: {
        senderId,
        receiverId: receiver.id,
        amount,
        description,
        status: isFlagged ? "FLAGGED" : "ON_HOLD",
        heldAt: now,
        releaseAt,
        holdDuration: HOLD_DURATION_SECONDS,
        receiverNameAtTime: receiver.name,
        senderIpAddress: ipAddress || null,
        riskScore,
        flaggedReason: isFlagged ? `Auto-flagged: risk score ${riskScore}/100` : null,
      },
    });

    // Create the escrow vault record
    await tx.escrow.create({
      data: {
        transactionId: transaction.id,
        amount,
        status: isFlagged ? "FROZEN" : "LOCKED",
        lockedAt: now,
        releaseAt,
      },
    });

    // Log the initial state transition
    await _logTransition(
      tx,
      transaction.id,
      "INITIATED",
      isFlagged ? "FLAGGED" : "ON_HOLD",
      "CONTRACT_ENGINE",
      isFlagged
        ? `High risk score (${riskScore}/100) — escrow frozen pending review`
        : `Escrow locked. Auto-settle at ${releaseAt.toISOString()}`
    );

    return transaction;
  });

  // --- Step 7: Notify both parties ---
  await _notify(prisma, senderId, "Payment Sent", `₹${amount} sent to ${receiver.name} is held in escrow until ${releaseAt.toLocaleString("en-IN")}`);
  if (!isFlagged) {
    await _notify(prisma, receiver.id, "Incoming Payment", `₹${amount} from ${sender.name} will be released to you in 24 hours`);
  }

  return {
    transaction: result,
    warning: validation.warning || null,
    isFlagged,
    riskScore,
    releaseAt,
    receiverName: receiver.name,
  };
}

// =============================================================================
// CONTRACT: cancelTransaction
// Sender can cancel within the CANCEL_WINDOW (1 hour of initiation).
// After that, only a dispute can trigger a revert.
//
// Equivalent to a smart contract's cancel() with time-lock.
// =============================================================================

async function cancelTransaction({ transactionId, requesterId }) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { escrow: true, sender: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.senderId !== requesterId) throw new Error("Only the sender can cancel this transaction");
  if (!["ON_HOLD", "FLAGGED"].includes(tx.status)) {
    throw new Error(`Cannot cancel a transaction in status: ${tx.status}`);
  }

  // Enforce the cancel window — after 1 hour, sender must raise a dispute instead
  const secondsElapsed = (Date.now() - new Date(tx.heldAt).getTime()) / 1000;
  if (secondsElapsed > CANCEL_WINDOW_SECONDS) {
    throw new Error("Cancel window has expired (1 hour). Please raise a dispute instead.");
  }

  // Refund + update state atomically
  await prisma.$transaction(async (prismaClient) => {
    await prismaClient.user.update({
      where: { id: tx.senderId },
      data: { balance: { increment: tx.amount } },
    });

    await prismaClient.transaction.update({
      where: { id: transactionId },
      data: { status: "CANCELLED", revertedAt: new Date() },
    });

    await prismaClient.escrow.update({
      where: { transactionId },
      data: { status: "REVERTED", unlockedAt: new Date(), unlockedBy: "SENDER_CANCEL" },
    });

    await _logTransition(prismaClient, transactionId, tx.status, "CANCELLED", "USER", "Sender cancelled within the 1-hour cancel window");
  });

  await _notify(prisma, tx.senderId, "Payment Cancelled", `₹${tx.amount} has been returned to your TarPay balance`);

  return { success: true, refundedAmount: tx.amount };
}

// =============================================================================
// CONTRACT: raiseDispute
// Sender raises a dispute during the 24-hour hold window.
// Freezes the escrow — neither party can access funds until resolved.
// =============================================================================

async function raiseDispute({ transactionId, raisedById, reason, description }) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { escrow: true, dispute: true, receiver: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.senderId !== raisedById) throw new Error("Only the sender can raise a dispute");
  if (tx.dispute) throw new Error("A dispute already exists for this transaction");
  if (!["ON_HOLD"].includes(tx.status)) {
    throw new Error(`Cannot raise dispute on a transaction in status: ${tx.status}`);
  }

  // Dispute must be raised before the hold window closes
  if (new Date() > new Date(tx.releaseAt)) {
    throw new Error("Hold window has expired. The payment has already been released.");
  }

  await prisma.$transaction(async (prismaClient) => {
    // Freeze the escrow — funds locked, no auto-settle will run
    await prismaClient.escrow.update({
      where: { transactionId },
      data: { status: "FROZEN" },
    });

    // Create dispute record
    await prismaClient.dispute.create({
      data: { transactionId, raisedById, reason, description, status: "OPEN" },
    });

    await prismaClient.transaction.update({
      where: { id: transactionId },
      data: { status: "DISPUTED" },
    });

    await _logTransition(prismaClient, transactionId, "ON_HOLD", "DISPUTED", "USER", `Dispute raised: ${reason}`);
  });

  // Notify receiver that funds are under dispute
  await _notify(prisma, tx.receiverId, "Payment Disputed", `₹${tx.amount} payment from sender is under dispute. Funds are frozen pending resolution.`);

  return { success: true, message: "Dispute raised. Escrow is frozen. Our team will review within 24 hours." };
}

// =============================================================================
// CONTRACT: resolveDispute
// Admin resolves a dispute — either settle (release to receiver) or revert (return to sender).
// In a full production system, this could be partially automated by AI evidence scoring.
// =============================================================================

async function resolveDispute({ transactionId, resolution, resolvedBy }) {
  // resolution must be "REVERT" or "SETTLE"
  if (!["REVERT", "SETTLE"].includes(resolution)) {
    throw new Error("Resolution must be either REVERT or SETTLE");
  }

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { dispute: true, sender: true, receiver: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.status !== "DISPUTED") throw new Error("Transaction is not in DISPUTED status");

  const isRevert  = resolution === "REVERT";
  const newStatus = isRevert ? "REVERTED" : "SETTLED";

  await prisma.$transaction(async (prismaClient) => {
    if (isRevert) {
      // Return funds to sender
      await prismaClient.user.update({
        where: { id: tx.senderId },
        data: { balance: { increment: tx.amount } },
      });
      // Bump receiver's fraud score — disputed and found guilty
      await prismaClient.user.update({
        where: { id: tx.receiverId },
        data: { fraudScore: { increment: 10 } },
      });
    } else {
      // Release funds to receiver
      await prismaClient.user.update({
        where: { id: tx.receiverId },
        data: { balance: { increment: tx.amount } },
      });
    }

    await prismaClient.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        settledAt: isRevert ? null : new Date(),
        revertedAt: isRevert ? new Date() : null,
      },
    });

    await prismaClient.escrow.update({
      where: { transactionId },
      data: {
        status: isRevert ? "REVERTED" : "RELEASED",
        unlockedAt: new Date(),
        unlockedBy: "DISPUTE_RESOLVED",
      },
    });

    await prismaClient.dispute.update({
      where: { transactionId },
      data: {
        status: isRevert ? "RESOLVED_REVERT" : "RESOLVED_SETTLE",
        resolution: resolvedBy,
        resolvedAt: new Date(),
      },
    });

    await _logTransition(prismaClient, transactionId, "DISPUTED", newStatus, "ADMIN", `Dispute resolved: ${resolution} by ${resolvedBy}`);
  });

  const senderMsg  = isRevert ? `₹${tx.amount} has been returned after dispute resolution` : `Your dispute was reviewed. Payment of ₹${tx.amount} was released to the receiver.`;
  const receiverMsg = isRevert ? `Dispute resolved against you. ₹${tx.amount} has been returned to sender.` : `Dispute resolved in your favour. ₹${tx.amount} has been credited.`;

  await _notify(prisma, tx.senderId,   "Dispute Resolved", senderMsg);
  await _notify(prisma, tx.receiverId, "Dispute Resolved", receiverMsg);

  return { success: true, resolution: newStatus };
}

// =============================================================================
// CONTRACT: autoSettle (called by the cron job every 5 minutes)
// Finds all ON_HOLD transactions whose releaseAt time has passed
// and settles them — releasing funds to the receiver.
//
// This is the "block finalisation" equivalent in our engine.
// =============================================================================

async function autoSettle() {
  const now = new Date();

  // Find all transactions that have passed their hold window and are still on hold
  const due = await prisma.transaction.findMany({
    where: { status: "ON_HOLD", releaseAt: { lte: now } },
    include: { escrow: true, receiver: true, sender: true },
  });

  let settled = 0;

  for (const tx of due) {
    try {
      await prisma.$transaction(async (prismaClient) => {
        // Credit receiver
        await prismaClient.user.update({
          where: { id: tx.receiverId },
          data: { balance: { increment: tx.amount } },
        });

        await prismaClient.transaction.update({
          where: { id: tx.id },
          data: { status: "SETTLED", settledAt: now },
        });

        await prismaClient.escrow.update({
          where: { transactionId: tx.id },
          data: { status: "RELEASED", unlockedAt: now, unlockedBy: "AUTO_SETTLE" },
        });

        await _logTransition(prismaClient, tx.id, "ON_HOLD", "SETTLED", "CRON", "Auto-settled after 24-hour hold window");
      });

      await _notify(prisma, tx.receiverId, "Payment Received!", `₹${tx.amount} from ${tx.sender.name} has been credited to your balance`);
      await _notify(prisma, tx.senderId,   "Payment Settled",  `Your payment of ₹${tx.amount} to ${tx.receiver.name} has been settled`);

      settled++;
    } catch (err) {
      // Log but don't throw — we want the cron to continue for other transactions
      console.error(`[AutoSettle] Failed to settle tx ${tx.id}:`, err.message);
    }
  }

  console.log(`[AutoSettle] Settled ${settled}/${due.length} transactions at ${now.toISOString()}`);
  return { settled, total: due.length };
}

// =============================================================================
// EXPORTS — public interface of the TarPay Contract Engine
// =============================================================================

module.exports = {
  validateReceiver,
  assessRisk,
  initiateTransaction,
  cancelTransaction,
  raiseDispute,
  resolveDispute,
  autoSettle,
};
