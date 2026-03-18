# TarPay 💳

> *"Paise bhejo, darr nahi"*

TarPay is a DeFi-inspired UPI escrow engine for Bharat. Every payment goes through a 24-hour safety hold — wrong payment? Cancel instantly. Dispute? Funds frozen until resolved.

**Built for HACK HUSTLE 2.0 — FinTech Track.**

---

## Monorepo Structure

```
tarpay/
├── contract/
│   └── src/engine.js          ← TarPay Contract Engine (the brain)
├── backend/
│   ├── prisma/schema.prisma   ← Full DB schema
│   └── src/
│       ├── index.js           ← Server entry point + cron
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── transactions.js
│           ├── disputes.js
│           ├── users.js
│           └── admin.js
└── tests/
    └── TarPay.postman_collection.json
```

---

## Quick Start

```bash
# 1. Install
cd backend && npm install

# 2. Setup env
cp .env.example .env
# Add DATABASE_URL and JWT_SECRET

# 3. Migrate DB
npx prisma migrate dev --name init
npx prisma generate

# 4. Seed demo data
node src/utils/seed.js

# 5. Run
npm run dev
# → http://localhost:4000
```

---

## Demo Accounts (after seed)

| UPI ID | Password | Role | Balance |
|---|---|---|---|
| rahul@tarpay | password123 | Consumer | ₹50,000 |
| priya@tarpay | password123 | Consumer | ₹25,000 |
| samosa@tarpay | password123 | Merchant | ₹5,000 |
| fraud@tarpay | password123 | High Risk | ₹1,000 |

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login → JWT |
| GET | /api/transactions/validate/:upiId | ✅ | Pre-payment check |
| POST | /api/transactions/send | ✅ | Send (escrow hold) |
| POST | /api/transactions/:id/cancel | ✅ | Cancel (1hr window) |
| GET | /api/transactions/history | ✅ | Tx history |
| GET | /api/transactions/:id | ✅ | Tx detail + audit log |
| POST | /api/disputes/raise | ✅ | Raise dispute |
| GET | /api/disputes/my | ✅ | My disputes |
| GET | /api/users/me | ✅ | Profile + balance |
| GET | /api/users/dashboard | ✅ | Analytics |
| GET | /api/users/notifications | ✅ | Notifications |
| POST | /api/admin/disputes/:id/resolve | 🔐 Admin | Resolve dispute |
| GET | /api/admin/disputes | 🔐 Admin | All open disputes |
| GET | /api/admin/flagged | 🔐 Admin | Flagged transactions |
| POST | /api/admin/settle | 🔐 Admin | Manual auto-settle |

---

## The Contract Engine

`contract/src/engine.js` — TarPay's core. Think of it as a smart contract running on our infra.

| Function | What it does |
|---|---|
| validateReceiver | Check UPI ID before money moves |
| assessRisk | Score 0-100 fraud risk per transaction |
| initiateTransaction | Lock funds in escrow atomically |
| cancelTransaction | 1-hour hard cancel window |
| raiseDispute | Freeze escrow, open investigation |
| resolveDispute | Admin settles or reverts |
| autoSettle | Cron: release after 24hr hold |

---

## Postman

Import `tests/TarPay.postman_collection.json`:
1. Login first → token auto-saves
2. Send Payment → tx_id auto-saves
3. Test full flow: validate → send → cancel/dispute → resolve

---

## Stack

Node.js · Express · Prisma · PostgreSQL · JWT · node-cron

*Mobile (Expo) — next phase*
# tarpay
