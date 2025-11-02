const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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

  // Create default admin jika belum ada
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })

  if (!existingAdmin) {
    // Hash password: admin123 (default password)
    const hashedPassword = await bcrypt.hash('2MKh5LSEYXTCS9dH87kKrLmFfo2Ft62SXQt3OeGFc8sEjyrYbqcoL9QHqrC8fjIvxUJYSIv903fZoXTeS6KyBgAqKeqQeMyAPfaywyA0P4gjXlLQhPLyDVbhQJ', 10)
    
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@mem.ai',
        password: hashedPassword,
        role: 'admin'
      }
    })
    console.log('✅ Default admin created:', { username: admin.username, email: admin.email })
    console.log('⚠️  Default password: admin123 - Please change after first login!')
  } else {
    console.log('ℹ️  Admin dengan username "admin" sudah ada, skip creating')
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
