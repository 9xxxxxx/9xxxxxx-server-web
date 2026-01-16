import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = ["React", "Next.js", "TypeScript", "AI", "Design", "UI/UX", "Life", "Career", "Tutorial"];
const CATEGORIES = ["Tech", "Life", "Design", "Review"];

async function main() {
  console.log("Start seeding tags...");
  
  const posts = await prisma.post.findMany();
  console.log(`Found ${posts.length} posts.`);

  for (const post of posts) {
    // Pick 1 random category
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Pick 1-3 random tags
    const shuffledTags = TAGS.sort(() => 0.5 - Math.random());
    const randomTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 1);

    await prisma.post.update({
      where: { id: post.id },
      data: {
        category: randomCategory,
        tags: randomTags
      }
    });
    console.log(`Updated post "${post.title}": Category=${randomCategory}, Tags=${randomTags.join(", ")}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
