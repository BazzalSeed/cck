import { NextResponse } from "next/server";
import { getTicketById, updateTicket, deleteTicket } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getTicketById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { category, product_code, part_name, material, processes } = body;

  const processList = processes
    ? (processes as string).split(" → ").filter(Boolean)
    : [];

  await updateTicket(id, {
    category: category ?? existing.category,
    product_code: product_code ?? existing.product_code,
    part_name: part_name ?? existing.part_name,
    material: material ?? existing.material,
    processes: processList.join(" → "),
    process_count: processList.length,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await deleteTicket(id);
  return NextResponse.json({ ok: true });
}
