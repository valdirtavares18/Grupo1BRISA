import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

if (!globalForPrisma.prisma) {
  prisma.$on('query' as never, (e: any) => {
    console.log('🔷 [Prisma Query]:', e.query)
    console.log('🔷 [Prisma Params]:', e.params)
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
