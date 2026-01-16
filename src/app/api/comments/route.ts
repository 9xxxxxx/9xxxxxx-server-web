import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const postId = searchParams.get("postId");

  if (!projectId && !postId) {
     return NextResponse.json({ comments: [] });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(postId ? { postId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, guestName, projectId, postId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        guestName: guestName || "Guest",
        ...(projectId ? { projectId } : {}),
        ...(postId ? { postId } : {}),
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
