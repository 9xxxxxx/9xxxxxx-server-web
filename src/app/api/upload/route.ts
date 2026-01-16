import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // 3. Validate File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Simple validation (check mime type or just extension)
    // For now, accept images
    if (!file.type.startsWith("image/")) {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    // 4. Create Directory (public/uploads/YYYY/MM)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const relativeDir = `uploads/${year}/${month}`;
    const uploadDir = path.join(process.cwd(), "public", relativeDir);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // 5. Save File
    // Use UUID to prevent filename collisions
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // 6. Return Public URL
    const publicUrl = `/${relativeDir}/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Upload Error", { status: 500 });
  }
}
