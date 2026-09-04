const { Pool, neonConfig, neon } = require("@neondatabase/serverless");
const { PrismaNeon, PrismaNeonHttp } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_VRQK6NigI0cO@ep-old-boat-ayq7fxbk-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function testHttp() {
  console.log("Testing HTTP adapter...");
  try {
    const adapter = new PrismaNeonHttp(connectionString);
    const prisma = new PrismaClient({ adapter });
    const count = await prisma.user.count();
    console.log("HTTP Success! User count:", count);
  } catch (err) {
    console.error("HTTP Error:", err.message);
  }
}

async function testWebSocket() {
  console.log("Testing WebSocket Pool adapter...");
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    const count = await prisma.user.count();
    console.log("WebSocket Success! User count:", count);
  } catch (err) {
    console.error("WebSocket Error:", err.message);
  }
}

async function testDirect() {
  console.log("Testing Direct PrismaClient...");
  try {
    const prisma = new PrismaClient();
    const count = await prisma.user.count();
    console.log("Direct Success! User count:", count);
  } catch (err) {
    console.error("Direct Error:", err.message);
  }
}

async function run() {
  await testHttp();
  await testWebSocket();
  await testDirect();
  process.exit(0);
}

run();
