import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const HistoryQuerySchema = z.object({
  phone: z.string().min(6),
  email: z.string().email().optional(),
});

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function phoneMatches(inputPhone: string, orderPhone: string) {
  const input = normalizePhone(inputPhone);
  const order = normalizePhone(orderPhone);

  if (!input || !order) return false;
  if (input === order) return true;

  const inputLast10 = input.slice(-10);
  const orderLast10 = order.slice(-10);
  return inputLast10.length >= 10 && inputLast10 === orderLast10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") ?? "";
    const emailRaw = searchParams.get("email") ?? undefined;

    const parsed = HistoryQuerySchema.safeParse({
      phone,
      email: emailRaw ? emailRaw : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const requestedPhone = parsed.data.phone;
    const requestedEmail = parsed.data.email?.trim().toLowerCase();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 100,
    });

    const matchedOrders = orders.filter((order) => {
      if (!phoneMatches(requestedPhone, order.phone)) return false;

      // Phone number is the primary lookup key.
      // If email is provided, we still allow phone matches when the saved order
      // has no email or was placed with a different formatting/account.
      if (!requestedEmail) return true;
      if (!order.email) return true;

      return order.email.trim().toLowerCase() === requestedEmail;
    });

    return NextResponse.json(
      {
        orders: matchedOrders.map((o) => {
          const subtotalPaise = o.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0);
          return {
            id: o.id,
            status: o.status,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
            customerName: o.customerName,
            city: o.city,
            pincode: o.pincode,
            subtotalPaise,
            itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
          };
        }),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

