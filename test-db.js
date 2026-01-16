const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 检查数据库连接...");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    console.log("✅ 数据库连接成功!");
    console.log("👥 用户数量:", users.length);
    console.log("\n用户列表:");
    users.forEach((user) => {
      console.log("  - ID:", user.id);
      console.log("    邮箱:", user.email);
      console.log("    姓名:", user.name);
      console.log("    密码哈希:", user.password.substring(0, 20) + "...");
      console.log("");
    });
  } catch (error) {
    console.error("❌ 数据库连接失败:", error.message);
  }
}

main().finally(() => prisma.$disconnect());
