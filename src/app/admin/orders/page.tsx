import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINRFromPaise } from "@/lib/money";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { OrderStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await getServerSession(authOptions);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Latest 100 placed orders.
          </p>
        </div>
        <Link
          href="/admin/logout"
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          Logout
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((o) => {
          const subtotal = o.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0);
          return (
            <div
              key={o.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {o.customerName} • {o.phone}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {o.addressLine1}
                    {o.addressLine2 ? `, ${o.addressLine2}` : ""}, {o.city} - {o.pincode}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  {o.notes ? (
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      Notes: {o.notes}
                    </div>
                  ) : null}
                  <div className="pt-1 font-mono text-xs text-zinc-500 dark:text-zinc-500">
                    {o.id}
                  </div>
                </div>

                <div className="min-w-[240px] space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {o.status}
                    </span>
                  </div>
                  <form
                    action={async (formData) => {
                      "use server";
                      const status = formData.get("status") as OrderStatus;
                      await updateOrderStatus(o.id, status);
                    }}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="status"
                      defaultValue={o.status}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {Object.values(OrderStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      Save
                    </button>
                  </form>
                  <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {subtotal > 0 ? formatINRFromPaise(subtotal) : "Price on request"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {o.items.map((i) => (
                  <div
                    key={i.id}
                    className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="h-14 w-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={i.imageUrl}
                        alt={i.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{i.productName}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Qty: {i.quantity}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs font-semibold">
                      {i.unitPaise > 0 ? formatINRFromPaise(i.unitPaise * i.quantity) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            No orders yet.
          </div>
        ) : null}
      </div>
    </main>
  );
}

