import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create dummy token dengan ID 1 jika belum ada
  const existingToken = await prisma.token.findUnique({
    where: { id: 1 }
  })

  if (!existingToken) {
    const token = await prisma.token.create({
      data: {
        id: 1,
        authAccessToken: 'dummy_access_token',
        authRefreshToken: 'dummy_refresh_token'
      }
    })
    console.log('✅ Dummy token created:', token)
  } else {
    console.log('ℹ️  Token dengan ID 1 sudah ada, skip creating')
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
