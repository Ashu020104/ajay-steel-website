"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
    >
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

