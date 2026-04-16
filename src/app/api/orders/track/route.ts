import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TrackQuerySchema = z.object({
  orderId: z.string().min(3),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") ?? "";

    const parsed = TrackQuerySchema.safeParse({ orderId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const subtotalPaise = order.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0);

    return NextResponse.json(
      {
        order: {
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          customerName: order.customerName,
          city: order.city,
          pincode: order.pincode,
          subtotalPaise,
          items: order.items.map((i) => ({
            id: i.id,
            productName: i.productName,
            imageUrl: i.imageUrl,
            unitPaise: i.unitPaise,
            quantity: i.quantity,
          })),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

