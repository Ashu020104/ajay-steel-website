"use server";

import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

