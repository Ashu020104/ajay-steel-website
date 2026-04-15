import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ inStock: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Add items to cart and place an order. We’ll confirm availability and deliver.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              description: p.description,
              imageUrl: p.imageUrl,
              pricePaise: p.pricePaise,
              inStock: p.inStock,
            }}
            priority={idx < 6}
          />
        ))}
      </div>
    </main>
  );
}

