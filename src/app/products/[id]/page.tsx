import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatINRFromPaise } from "@/lib/money";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();

  const price =
    product.pricePaise > 0 ? formatINRFromPaise(product.pricePaise) : "Price on request";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>
            <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {price}
            </div>
            {!product.inStock ? (
              <div className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                Out of stock (you can still contact us)
              </div>
            ) : null}
          </div>

          <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                pricePaise: product.pricePaise,
              }}
            />
            <a
              href="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Go to cart
            </a>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Final price/availability may vary based on size, gauge, and current stock. We’ll confirm
            after order placement.
          </div>
        </div>
      </div>
    </main>
  );
}

