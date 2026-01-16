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

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (slug !== existingProject.slug) {
      const slugCheck = await prisma.project.findUnique({
        where: { slug },
      });
      if (slugCheck) {
        return new NextResponse("Slug already exists", { status: 400 });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
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
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PUT]", error);
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

    const project = await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
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

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET_SINGLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
