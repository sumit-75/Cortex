const { PrismaClient } = require("@prisma/client");

async function testDirect() {
  console.log("Testing Direct PrismaClient query...");
  const start = Date.now();
  try {
    const prisma = new PrismaClient();
    const count = await prisma.user.count();
    const posts = await prisma.post.findMany();
    console.log(`Success in ${Date.now() - start}ms! Users: ${count}, Posts: ${posts.length}`);
  } catch (err) {
    console.error("Direct Error:", err);
  }
}

testDirect();
