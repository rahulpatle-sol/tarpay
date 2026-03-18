/**
 * Seed Script
 * Creates demo users and transactions for local development and hackathon demos.
 * Run: node src/utils/seed.js
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const engine = require("../../../contract/src/engine");

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding TarPay demo data...");

  const hash = await bcrypt.hash("password123", 10);

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({ where: { upiId: "rahul@tarpay" },   update: {}, create: { name: "Rahul Sharma",   phone: "9876543210", upiId: "rahul@tarpay",   passwordHash: hash, balance: 50000 } }),
    prisma.user.upsert({ where: { upiId: "priya@tarpay" },   update: {}, create: { name: "Priya Singh",    phone: "9876543211", upiId: "priya@tarpay",   passwordHash: hash, balance: 25000 } }),
    prisma.user.upsert({ where: { upiId: "samosa@tarpay" },  update: {}, create: { name: "Rajat Samosa Stall", phone: "9876543212", upiId: "samosa@tarpay", passwordHash: hash, balance: 5000, isMerchant: true, businessName: "Rajat ka Samosa Corner" } }),
    prisma.user.upsert({ where: { upiId: "fraud@tarpay" },   update: {}, create: { name: "Suspicious User", phone: "9876543213", upiId: "fraud@tarpay",  passwordHash: hash, balance: 1000, fraudScore: 80 } }),
  ]);

  console.log(`Created ${users.length} users`);
  console.log("\nDemo credentials (all passwords: password123):");
  users.forEach(u => console.log(`  ${u.upiId} — balance: ${u.balance}`));
  console.log("\nSeed complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
