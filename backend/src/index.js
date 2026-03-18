/**
 * TarPay Backend — Entry Point
 * Boots the Express server, mounts all routes, and starts the cron scheduler.
 */

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const cron    = require("node-cron");

const authRoutes        = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const disputeRoutes     = require("./routes/disputes");
const userRoutes        = require("./routes/users");
const adminRoutes       = require("./routes/admin");
const { autoSettle }    = require("../../contract/src/engine");

const app  = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// Attach client IP to every request so the engine can log it
app.use((req, _res, next) => {
  req.clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth",         authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/disputes",     disputeRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/admin",        adminRoutes);

// Health check — useful for Railway / Render deployments
app.get("/health", (_req, res) => res.json({ status: "ok", service: "TarPay Backend", ts: new Date() }));

// ---------------------------------------------------------------------------
// Cron — Auto-settle every 5 minutes
// The Contract Engine checks for transactions whose 24hr hold has expired
// and releases funds to receivers automatically.
// ---------------------------------------------------------------------------
cron.schedule("*/5 * * * *", async () => {
  console.log("[Cron] Running auto-settle...");
  await autoSettle();
});

// ---------------------------------------------------------------------------
// Global error handler — catches any unhandled errors from routes
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ TarPay backend running on http://localhost:${PORT}`);
});
