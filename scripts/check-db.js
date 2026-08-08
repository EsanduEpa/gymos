const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_ofJ0PA6RBWyz@ep-summer-math-av1xod1z-pooler.c-11.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    }
  }
})

async function checkDb() {
  try {
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@fitgym.com' }
    })
    console.log("Found Owner:", owner)
    
    const count = await prisma.user.count()
    console.log("Total users in Neon DB:", count)
  } catch (error) {
    console.error("Database connection error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDb()
