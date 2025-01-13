import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const latestRecord = await prisma.bloodSugarRecord.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(latestRecord);
  } catch (error) {
    console.error("Error fetching latest record:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest record" },
      { status: 500 }
    );
  }
} 