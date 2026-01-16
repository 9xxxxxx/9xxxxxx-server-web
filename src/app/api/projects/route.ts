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
    const {
      title,
      slug,
      description,
      fullDescription,
      techStack,
      features,
      githubLink,
      demoLink,
      image,
      category,
      published,
    } = body;

    if (!title || !slug || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if slug exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: slug as string },
    });

    if (existingProject) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        fullDescription: fullDescription || "",
        techStack: techStack || [],
        features: features || [],
        githubLink: githubLink || "",
        demoLink: demoLink || "",
        image: image || "",
        category: category || "Web App",
        published: published || false,
        authorId: session.user.id!,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
