import { prisma } from "@/lib/db";

export async function getSiteConfig() {
  const config = await prisma.siteConfig.findFirst();
  
  if (!config) {
    return await prisma.siteConfig.create({
      data: {
        ownerName: "Garry",
        avatarInitial: "G",
        avatarGradient: "from-blue-600 to-indigo-600",
      }
    });
  }
  
  return config;
}
