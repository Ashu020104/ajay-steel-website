import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateOrderSchema = z.object({
  customer: z.object({
    customerName: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional().or(z.literal("")),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().min(2),
    pincode: z.string().min(4),
    notes: z.string().optional().or(z.literal("")),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { customer, items } = parsed.data;
    const phone = customer.phone.replace(/\s/g, "");
    const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueIds } },
    });

    if (products.length !== uniqueIds.length) {
      return NextResponse.json({ error: "Some products are not available." }, { status: 400 });
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName: customer.customerName,
          phone,
          email: customer.email ? customer.email : null,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 ? customer.addressLine2 : null,
          city: customer.city,
          pincode: customer.pincode,
          notes: customer.notes ? customer.notes : null,
          items: {
            create: items.map((i) => {
              const p = productById.get(i.productId)!;
              return {
                productId: p.id,
                productName: p.name,
                imageUrl: p.imageUrl,
                unitPaise: p.pricePaise,
                quantity: i.quantity,
              };
            }),
          },
        },
        select: { id: true },
      });
      return created;
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

