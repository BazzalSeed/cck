import { NextResponse } from "next/server";
import { getProductCodes } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  if (!category) return NextResponse.json([]);
  return NextResponse.json(await getProductCodes(category));
}
