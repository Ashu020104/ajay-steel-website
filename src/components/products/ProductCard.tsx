import Link from "next/link";
import { formatINRFromPaise } from "@/lib/money";

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pricePaise: number;
  inStock: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const price =
    product.pricePaise > 0 ? formatINRFromPaise(product.pricePaise) : "Price on request";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
        {/* Using <img> keeps setup simple for local & remote URLs */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {product.name}
            </div>
            <div className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              {product.description}
            </div>
          </div>
          <div className="shrink-0 text-right text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {price}
          </div>
        </div>
        {!product.inStock ? (
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Out of stock
          </div>
        ) : null}
      </div>
    </Link>
  );
}

