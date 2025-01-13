import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Tambahkan interface untuk whereConditions
interface WhereConditions {
  userId: string;
  OR?: {
    description?: { contains: string; mode: 'insensitive' | 'default' };
    condition?: { contains: string; mode: 'insensitive' | 'default' };
  }[];
  date?: string;
  condition?: string;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const condition = searchParams.get('condition');

    const whereConditions: WhereConditions = {
      userId,
      OR: []
    };

    if (search) {
      whereConditions.OR?.push(
        { description: { contains: search, mode: 'insensitive' } },
        { condition: { contains: search, mode: 'insensitive' } }
      );
    }

    if (date) {
      whereConditions.date = date;
    }

    if (condition && condition !== 'unassigned') {
      whereConditions.condition = condition;
    }

    // Jika tidak ada kondisi pencarian, hapus OR array kosong
    if (!whereConditions.OR?.length) {
      delete whereConditions.OR;
    }

    const records = await prisma.bloodSugarRecord.findMany({
      where: whereConditions as Prisma.BloodSugarRecordWhereInput,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, data: records }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error fetching records:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Gagal mengambil data"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized" }), 
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("Received request body:", body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Format data tidak valid" 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }
    
    // Validasi data yang diperlukan
    if (!body.date || !body.time || !body.bloodSugar || !body.age) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Data tidak lengkap" 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    const record = await prisma.bloodSugarRecord.create({
      data: {
        userId,
        date: body.date,
        time: body.time,
        bloodSugar: Number(body.bloodSugar),
        age: String(body.age),
        type: body.type || 'food',
        description: body.description || '',
        condition: body.condition || 'normal'
      }
    });

    console.log("Created record:", record);

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        data: record 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );

  } catch (error) {
    console.error("Error creating record:", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Gagal menyimpan data" 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    // Verifikasi kepemilikan data
    const existingRecord = await prisma.bloodSugarRecord.findFirst({
      where: { id, userId }
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const record = await prisma.bloodSugarRecord.update({
      where: { id },
      data: {
        ...data,
        bloodSugar: Number(data.bloodSugar),
        age: String(data.age)
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, data: record }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Error updating record:", err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate data"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    // Verifikasi kepemilikan data
    const existingRecord = await prisma.bloodSugarRecord.findFirst({
      where: { id, userId }
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    await prisma.bloodSugarRecord.delete({
      where: { id }
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: "Data berhasil dihapus" 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Error deleting record:", err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Gagal menghapus data"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 