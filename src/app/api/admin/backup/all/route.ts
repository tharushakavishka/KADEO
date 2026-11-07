import { NextRequest, NextResponse } from "next/server";
import { exportAllStoresBackup } from "@/features/admin/backup-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const res = await exportAllStoresBackup();

    if (!res.success || !res.data) {
      return NextResponse.json(
        { error: res.error || "Failed to generate all stores backup" },
        { status: res.status || 500 }
      );
    }

    const jsonStr = JSON.stringify(res.data, null, 2);
    const filename = `kadeo-platform-full-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
