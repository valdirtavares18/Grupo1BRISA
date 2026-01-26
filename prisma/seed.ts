import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const superAdmin = await prisma.platformUser.create({
    data: {
      email: 'admin@plataforma.com',
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })

  console.log('Super Admin criado:', superAdmin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
