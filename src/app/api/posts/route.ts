import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, slug, content, description, tags, published, category, coverImage } = body;

    if (!title || !slug || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if slug exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: slug as string },
    });

    if (existingPost) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        description: description || "",
        tags: tags || [],
        published: published || false,
        category: category || "Tech",
        coverImage: coverImage || null,
        authorId: session.user.id!,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
