import { NextResponse } from "next/server";
import { getMaterials } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const productCode = searchParams.get("product_code");
  const partName = searchParams.get("part_name");
  if (!category || !productCode || !partName) return NextResponse.json([]);
  return NextResponse.json(await getMaterials(category, productCode, partName));
}
