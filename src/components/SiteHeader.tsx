import Link from "next/link";
import { business } from "@/lib/business";
import { CartButton } from "@/components/cart/CartButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <Link
            href="/"
            className="block truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            {business.name}
          </Link>
          <div className="hidden truncate text-xs text-zinc-600 dark:text-zinc-400 sm:block">
            {business.tagline}
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Products
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Contact
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}

