import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, browser, os, device } = body;

    // Simple validation
    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // Create event
    await prisma.analyticsEvent.create({
      data: {
        path,
        browser: browser || "Unknown",
        os: os || "Unknown",
        device: device || "desktop", // Default fallback
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
