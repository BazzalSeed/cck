import { NextResponse } from "next/server";
import { getPartNames } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const productCode = searchParams.get("product_code");
  if (!category || !productCode) return NextResponse.json([]);
  return NextResponse.json(await getPartNames(category, productCode));
}
