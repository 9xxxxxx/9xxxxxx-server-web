import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, slug, content, description, tags, published, category, coverImage } = body;

    if (!title || !slug || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if post exists and user is author (optional: or admin)
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Verify slug uniqueness (if changed)
    if (slug !== existingPost.slug) {
      const slugCheck = await prisma.post.findUnique({
        where: { slug },
      });
      if (slugCheck) {
        return new NextResponse("Slug already exists", { status: 400 });
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        description,
        tags,
        published,
        category: category || "Tech",
        coverImage,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_GET_SINGLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
