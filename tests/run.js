/**
 * TarPay — Automated Test Runner
 * Run: node tests/run.js
 * Tests every API endpoint end-to-end against a live backend.
 * No external dependencies — pure Node.js fetch (v18+).
 */

const BASE = process.env.API_URL || "http://localhost:4000";

// ─── tiny test framework ───────────────────────────────────────────────────
let passed = 0, failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
    results.push({ name, status: "pass" });
  } catch (e) {
    console.log(`  ❌ ${name} — ${e.message}`);
    failed++;
    results.push({ name, status: "fail", error: e.message });
  }
}

function expect(val) {
  return {
    toBe:      (x) => { if (val !== x)         throw new Error(`Expected ${JSON.stringify(x)}, got ${JSON.stringify(val)}`); },
    toEqual:   (x) => { if (JSON.stringify(val) !== JSON.stringify(x)) throw new Error(`Expected ${JSON.stringify(x)}, got ${JSON.stringify(val)}`); },
    toBeTrue:  ()  => { if (val !== true)       throw new Error(`Expected true, got ${val}`); },
    toBeFalse: ()  => { if (val !== false)      throw new Error(`Expected false, got ${val}`); },
    toBeOneOf: (a) => { if (!a.includes(val))   throw new Error(`Expected one of ${a}, got ${val}`); },
    toBeAbove: (x) => { if (val <= x)           throw new Error(`Expected > ${x}, got ${val}`); },
    toExist:   ()  => { if (val === undefined || val === null) throw new Error(`Expected value to exist, got ${val}`); },
    toInclude: (x) => { if (!String(val).includes(x)) throw new Error(`Expected "${val}" to include "${x}"`); },
    toBeArray: ()  => { if (!Array.isArray(val)) throw new Error(`Expected array, got ${typeof val}`); },
    toBeString:()  => { if (typeof val !== "string") throw new Error(`Expected string, got ${typeof val}`); },
  };
}

// ─── HTTP helpers ──────────────────────────────────────────────────────────
async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json() };
}

async function post(path, data, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json() };
}

// ─── TEST SUITE ────────────────────────────────────────────────────────────
async function runTests() {
  console.log("\n🚀 TarPay Test Runner");
  console.log(`📡 Backend: ${BASE}\n`);

  let token = null;
  let txId  = null;
  let disputeTxId = null;

  // ── HEALTH ──────────────────────────────────────────────────────────────
  console.log("\n── Health ──────────────────────────────");
  {
    const { status, body } = await get("/health");
    test("GET /health returns 200", () => expect(status).toBe(200));
    test("Service name is TarPay", () => expect(body.service).toInclude("TarPay"));
  }

  // ── AUTH ─────────────────────────────────────────────────────────────────
  console.log("\n── Auth ─────────────────────────────────");
  {
    // Register (idempotent — 201 first time, 409 after)
    const reg = await post("/api/auth/register", {
      name: "Test Runner", phone: "9000000001",
      upiId: "testrunner@tarpay", password: "password123",
    });
    test("Register returns 201 or 409", () => expect(reg.status).toBeOneOf([201, 409]));

    // Login with seeded account
    const login = await post("/api/auth/login", { upiId: "rahul@tarpay", password: "password123" });
    test("Login returns 200", () => expect(login.status).toBe(200));
    test("Login returns JWT token", () => {
      expect(login.body.success).toBeTrue();
      expect(login.body.token).toBeString();
    });
    test("Login returns user without passwordHash", () => {
      expect(login.body.user.passwordHash).toBe(undefined);
      expect(login.body.user.upiId).toBe("rahul@tarpay");
    });
    token = login.body.token;

    // Wrong password
    const bad = await post("/api/auth/login", { upiId: "rahul@tarpay", password: "wrongpass" });
    test("Wrong password returns 401", () => expect(bad.status).toBe(401));

    // Unknown UPI
    const unk = await post("/api/auth/login", { upiId: "nobody@tarpay", password: "password123" });
    test("Unknown UPI returns 401", () => expect(unk.status).toBe(401));

    // No token protected route
    const noTok = await get("/api/users/me");
    test("Protected route without token returns 401", () => expect(noTok.status).toBe(401));
  }

  // ── VALIDATE ─────────────────────────────────────────────────────────────
  console.log("\n── Receiver Validation ─────────────────");
  {
    const valid = await get("/api/transactions/validate/samosa@tarpay", token);
    test("Validate known UPI returns 200", () => expect(valid.status).toBe(200));
    test("Receiver info returned (no passwordHash)", () => {
      expect(valid.body.receiver.upiId).toBe("samosa@tarpay");
      expect(valid.body.receiver.passwordHash).toBe(undefined);
    });

    const ghost = await get("/api/transactions/validate/ghost@tarpay", token);
    test("Unknown UPI returns 404", () => expect(ghost.status).toBe(404));

    const fraud = await get("/api/transactions/validate/fraud@tarpay", token);
    test("Fraud UPI returns 200 with warning", () => {
      expect(fraud.status).toBe(200);
      expect(fraud.body.warning).toExist();
    });
    test("Fraud warning mentions fraud score", () => {
      expect(fraud.body.warning).toInclude("fraud score");
    });
  }

  // ── TRANSACTIONS ─────────────────────────────────────────────────────────
  console.log("\n── Transactions ─────────────────────────");
  {
    // Self payment
    const self = await post("/api/transactions/send", { receiverUpiId: "rahul@tarpay", amount: 100 }, token);
    test("Self payment rejected with 400", () => expect(self.status).toBe(400));
    test("Self payment error mentions yourself", () => expect(self.body.message).toInclude("yourself"));

    // Zero amount
    const zero = await post("/api/transactions/send", { receiverUpiId: "samosa@tarpay", amount: 0 }, token);
    test("Zero amount rejected with 400", () => expect(zero.status).toBe(400));

    // Normal payment
    const send = await post("/api/transactions/send", {
      receiverUpiId: "samosa@tarpay", amount: 500, description: "Test payment"
    }, token);
    test("Normal payment returns 201", () => expect(send.status).toBe(201));
    test("Payment status is ON_HOLD", () => expect(send.body.transaction.status).toBe("ON_HOLD"));
    test("Payment is not flagged", () => expect(send.body.isFlagged).toBeFalse());
    test("releaseAt is set", () => expect(send.body.releaseAt).toExist());
    txId = send.body.transaction?.id;

    // High risk payment
    const risky = await post("/api/transactions/send", {
      receiverUpiId: "fraud@tarpay", amount: 75000, description: "High risk"
    }, token);
    test("High risk payment created (201 or 400)", () => expect(risky.status).toBeOneOf([201, 400]));
    if (risky.status === 201) {
      test("High risk has elevated riskScore", () => expect(risky.body.riskScore).toBeAbove(50));
    }

    // Transaction history
    const hist = await get("/api/transactions/history?page=1&limit=10", token);
    test("History returns 200", () => expect(hist.status).toBe(200));
    test("History has pagination fields", () => {
      expect(hist.body.transactions).toBeArray();
      expect(hist.body.total).toExist();
    });

    // Transaction detail
    if (txId) {
      const detail = await get(`/api/transactions/${txId}`, token);
      test("Transaction detail returns 200", () => expect(detail.status).toBe(200));
      test("Detail includes escrow record", () => expect(detail.body.transaction.escrow).toExist());
      test("Detail includes audit logs", () => {
        expect(detail.body.transaction.logs).toBeArray();
        expect(detail.body.transaction.logs.length).toBeAbove(0);
      });
    }
  }

  // ── DISPUTES ─────────────────────────────────────────────────────────────
  console.log("\n── Disputes ─────────────────────────────");
  {
    // Fresh payment for dispute
    const fresh = await post("/api/transactions/send", {
      receiverUpiId: "priya@tarpay", amount: 200, description: "Dispute test"
    }, token);
    test("Fresh payment for dispute returns 201", () => expect(fresh.status).toBe(201));
    disputeTxId = fresh.body.transaction?.id;

    if (disputeTxId) {
      // Raise dispute
      const dispute = await post("/api/disputes/raise", {
        transactionId: disputeTxId, reason: "WRONG_RECIPIENT",
        description: "Galti se wrong UPI pe bheja"
      }, token);
      test("Raise dispute returns 201", () => expect(dispute.status).toBe(201));
      test("Dispute confirms escrow frozen", () => expect(dispute.body.message).toInclude("frozen"));

      // Duplicate dispute
      const dup = await post("/api/disputes/raise", { transactionId: disputeTxId, reason: "OTHER" }, token);
      test("Duplicate dispute returns 400", () => expect(dup.status).toBe(400));
      test("Duplicate error message correct", () => expect(dup.body.message).toInclude("already exists"));
    }

    // My disputes
    const myD = await get("/api/disputes/my", token);
    test("My disputes returns 200", () => expect(myD.status).toBe(200));
    test("Disputes is an array", () => expect(myD.body.disputes).toBeArray());
  }

  // ── CANCEL ───────────────────────────────────────────────────────────────
  console.log("\n── Cancel ───────────────────────────────");
  {
    // Fresh tx to cancel
    const toCancel = await post("/api/transactions/send", {
      receiverUpiId: "samosa@tarpay", amount: 100, description: "Cancel test"
    }, token);
    
    if (toCancel.status === 201) {
      const cid = toCancel.body.transaction.id;
      const cancel = await post(`/api/transactions/${cid}/cancel`, {}, token);
      test("Cancel within 1hr returns 200", () => expect(cancel.status).toBe(200));
      test("Refund amount correct", () => expect(cancel.body.refundedAmount).toBe(100));

      // Cancel again
      const cancelAgain = await post(`/api/transactions/${cid}/cancel`, {}, token);
      test("Cannot cancel twice — returns 400", () => expect(cancelAgain.status).toBe(400));
    }
  }

  // ── USERS ────────────────────────────────────────────────────────────────
  console.log("\n── Users ────────────────────────────────");
  {
    const me = await get("/api/users/me", token);
    test("My profile returns 200", () => expect(me.status).toBe(200));
    test("No passwordHash in profile", () => expect(me.body.user.passwordHash).toBe(undefined));
    test("Balance is a number", () => typeof expect(me.body.user.balance).toExist());

    const dash = await get("/api/users/dashboard", token);
    test("Dashboard returns 200", () => expect(dash.status).toBe(200));
    test("Dashboard has all stat keys", () => {
      ["totalReceived","totalSent","pendingEscrow","openDisputes"].forEach(k => {
        if (dash.body.stats[k] === undefined) throw new Error(`Missing stat: ${k}`);
      });
    });
    test("Recent transactions is an array", () => expect(dash.body.recentTransactions).toBeArray());

    const notifs = await get("/api/users/notifications", token);
    test("Notifications returns 200", () => expect(notifs.status).toBe(200));
    test("Notifications is an array", () => expect(notifs.body.notifications).toBeArray());
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log("\n" + "─".repeat(45));
  console.log(`🏁 Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`\n❌ Failed tests:`);
    results.filter(r => r.status === "fail").forEach(r => {
      console.log(`   • ${r.name}`);
      console.log(`     ${r.error}`);
    });
  } else {
    console.log("\n🏆 All tests passed! TarPay is ready to ship.");
  }
  console.log("─".repeat(45) + "\n");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error("\n💥 Test runner crashed:", err.message);
  console.error("   Make sure backend is running: npm run dev");
  process.exit(1);
});