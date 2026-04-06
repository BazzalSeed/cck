import { NextResponse } from "next/server";
import { getTicket } from "@/lib/db";
import { renderTicketHtml } from "@/lib/ticket-html";
import puppeteer from "puppeteer-core";

export async function POST(request: Request) {
  const body = await request.json();
  const { category, product_code, part_name, material, ticket_number, factory_number, notes, signer, signer_date, material_checker, material_checker_date, quota, planned_quantity } = body;

  if (!category || !product_code || !part_name || !material) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ticket = await getTicket(category, product_code, part_name, material);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const processes = ticket.processes ? ticket.processes.split(" → ") : [];

  const html = renderTicketHtml({
    productCode: ticket.product_code,
    partName: ticket.part_name || "",
    material: ticket.material || "",
    processes,
    ticketNumber: ticket_number || "",
    factoryNumber: factory_number || "",
    notes: notes || "",
    signer: signer || "",
    signerDate: signer_date || "",
    materialChecker: material_checker || "",
    materialCheckerDate: material_checker_date || "",
    quota: quota || "",
    plannedQuantity: planned_quantity || "",
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const element = await page.$("#ticket");
  let imageBase64 = "";
  if (element) {
    const buffer = await element.screenshot({ type: "jpeg", quality: 95 });
    imageBase64 = Buffer.from(buffer).toString("base64");
  }

  await browser.close();

  return NextResponse.json({ image: imageBase64, html });
}
