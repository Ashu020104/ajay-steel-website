"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; imageUrl: string; pricePaise: number };
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(
          { productId: product.id, name: product.name, imageUrl: product.imageUrl, unitPaise: product.pricePaise },
          1,
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 900);
      }}
      className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}

