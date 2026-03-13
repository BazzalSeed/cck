import { NextRequest, NextResponse } from "next/server";
import { getAllTickets, createTicket } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
  const search = sp.get("search") || undefined;
  const category = sp.get("category") || undefined;

  const result = await getAllTickets(page, limit, search, category);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { category, product_code, part_name, material, processes } = body;

  if (!category || !product_code || !part_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const processList = processes
    ? (processes as string).split(" → ").filter(Boolean)
    : [];

  const id = await createTicket({
    category,
    product_code,
    part_name,
    material: material || "",
    processes: processList.join(" → "),
    process_count: processList.length,
  });

  return NextResponse.json({ id });
}
