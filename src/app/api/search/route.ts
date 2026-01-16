import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [posts, projects] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        select: {
          title: true,
          slug: true,
          description: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        select: {
          title: true,
          slug: true,
          description: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const results = [
      ...posts.map((post) => ({
        type: "Blog",
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        category: post.category,
      })),
      ...projects.map((project) => ({
        type: "Project",
        title: project.title,
        description: project.description,
        url: `/projects/${project.slug}`,
        category: project.category,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}
