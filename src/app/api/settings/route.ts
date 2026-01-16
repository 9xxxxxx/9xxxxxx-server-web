import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const ownerName = formData.get("ownerName") as string;
    const avatarInitial = formData.get("avatarInitial") as string;
    const avatarGradient = formData.get("avatarGradient") as string;
    const file = formData.get("avatarImage") as File | null;

    let avatarImagePath = undefined;

    // Handle File Upload
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = `avatar-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      const path = join(uploadDir, filename);

      // Ensure directory exists (basic check, though 'starts' script usually handles it)
      // For now assuming public folder exists. 
      // Ideally check if 'public/uploads' exists.
      
      await writeFile(path, buffer);
      avatarImagePath = `/uploads/${filename}`;
    }

    // Update DB
    const existingConfig = await prisma.siteConfig.findFirst();

    if (existingConfig) {
      const updated = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: { 
          ownerName, 
          avatarInitial, 
          avatarGradient,
          ...(avatarImagePath && { avatarImage: avatarImagePath }) // Only update if new image
        },
      });
      return NextResponse.json(updated);
    } else {
        const created = await prisma.siteConfig.create({
            data: { 
                ownerName, 
                avatarInitial, 
                avatarGradient,
                avatarImage: avatarImagePath 
            },
        });
        return NextResponse.json(created);
    }
    
  } catch (error) {
    console.error("[SETTINGS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
