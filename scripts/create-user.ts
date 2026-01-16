import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  console.log('🔐 创建管理员用户...')
  console.log('📧 邮箱:', email)
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: 'Admin'
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Admin'
    }
  })
  
  console.log('✅ 用户创建/更新成功!')
  console.log('👤 用户 ID:', user.id)
  console.log('📧 邮箱:', user.email)
  console.log('👨‍💼 姓名:', user.name)
  console.log('\n🔑 登录信息:')
  console.log('   邮箱:', email)
  console.log('   密码:', password)
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
