import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINRFromPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return notFound();

  const subtotal = order.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">Order placed</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Thank you. Your order has been placed successfully.
        </p>
        <div className="mt-4 text-sm">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Order ID</div>
          <div className="mt-1 font-mono text-sm">{order.id}</div>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="text-sm font-semibold">Summary</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{i.productName}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Qty: {i.quantity}</div>
                </div>
                <div className="shrink-0 font-semibold">
                  {i.unitPaise > 0 ? formatINRFromPaise(i.unitPaise * i.quantity) : "—"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
            <span>Subtotal</span>
            <span className="font-semibold">
              {subtotal > 0 ? formatINRFromPaise(subtotal) : "Price on request"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Continue shopping
          </Link>
          <Link
            href={`/orders?orderId=${order.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Track this order
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}

