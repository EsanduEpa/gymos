require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ include: { SessionPack: true } });
  console.log("Users with packs:", users.map(u => ({ email: u.email, role: u.role, packs: u.SessionPack.length })));
  
  const packs = await prisma.sessionPack.findMany();
  console.log("Packs:", packs.map(p => ({ id: p.id, user: p.userId, remaining: p.remainingSessions, status: p.status })));
  
  const sessions = await prisma.pTSession.findMany();
  console.log("Sessions:", sessions.length);
}
check().catch(console.error).finally(() => prisma.$disconnect());
