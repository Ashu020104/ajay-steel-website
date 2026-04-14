"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatINRFromPaise } from "@/lib/money";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0),
    [items],
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Review quantities and proceed to checkout to place an order.
          </p>
        </div>
        {items.length ? (
          <button
            type="button"
            onClick={() => clear()}
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Your cart is empty.{" "}
          <Link className="underline hover:no-underline" href="/products">
            Browse products
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            {items.map((i) => (
              <div
                key={i.productId}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="h-20 w-28 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{i.name}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {i.unitPaise > 0 ? formatINRFromPaise(i.unitPaise) : "Price on request"}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400">
                      Qty
                      <input
                        className="ml-2 w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        type="number"
                        min={1}
                        value={i.quantity}
                        onChange={(e) => setQuantity(i.productId, Number(e.target.value))}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(i.productId)}
                      className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold">
                  {i.unitPaise > 0
                    ? formatINRFromPaise(i.unitPaise * i.quantity)
                    : "—"}
                </div>
              </div>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Summary</div>
            <div className="mt-3 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
              <span>Subtotal</span>
              <span className="font-semibold">
                {subtotal > 0 ? formatINRFromPaise(subtotal) : "Price on request"}
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Delivery charges (if any) will be confirmed after order placement.
            </div>
            <Link
              href="/checkout"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

