import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const HistoryQuerySchema = z.object({
  phone: z.string().min(6),
  email: z.string().email().optional(),
});

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

    const rawPhone = parsed.data.phone;
    const normalizedPhone = rawPhone.replace(/\s/g, "");
    const phoneCandidates = Array.from(new Set([rawPhone, normalizedPhone]));

    // Keep this typing simple to avoid Prisma-generated type mismatches
    // during Next.js production type-check.
    const where: { phone: { in: string[] }; email?: string } = {
      phone: { in: phoneCandidates },
    };

    if (parsed.data.email) {
      // Only return orders that match the provided email.
      where.email = parsed.data.email;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 30,
    });

    return NextResponse.json(
      {
        orders: orders.map((o) => {
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

