import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

const CancelOrderBodySchema = z.object({
  orderId: z.string().min(3),
});

const MS_24_HOURS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = CancelOrderBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const orderId = parsed.data.orderId;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = Date.now();
    const createdAtMs = new Date(order.createdAt).getTime();
    const expiresAtMs = createdAtMs + MS_24_HOURS;

    if (now > expiresAtMs) {
      return NextResponse.json(
        { error: "Order can be cancelled only within 24 hours of placement." },
        { status: 400 },
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });
    }
    if (order.status === "DELIVERED") {
      return NextResponse.json({ error: "Delivered orders cannot be cancelled." }, { status: 400 });
    }

    const nextStatus: OrderStatus = "CANCELLED";
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: updated.id,
        status: updated.status,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

