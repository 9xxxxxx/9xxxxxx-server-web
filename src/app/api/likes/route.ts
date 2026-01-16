import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { projectId, postId } = await req.json();

    if (!projectId && !postId) {
      return NextResponse.json(
        { error: "Target (projectId or postId) required" },
        { status: 400 }
      );
    }

    if (projectId) {
      const project = await prisma.project.update({
        where: { id: projectId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({ likes: project.likes });
    }

    if (postId) {
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({ likes: post.likes });
    }

  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to like" },
      { status: 500 }
    );
  }
}
