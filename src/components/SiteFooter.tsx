import Link from "next/link";
import { business } from "@/lib/business";

export function SiteFooter() {
  const { address, contacts } = business;
  return (
    <footer className="mt-auto border-t border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {business.name}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{business.tagline}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {address.line1}, {address.line2}, {address.city} - {address.pincode}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Email:{" "}
            <a className="underline hover:no-underline" href={`mailto:${contacts.email}`}>
              {contacts.email}
            </a>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Phones: {contacts.phones.map((p) => `${p.label}: ${p.value}`).join(" • ")}
          </div>
        </div>

        <div className="space-y-2 sm:justify-self-end sm:text-right">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick links</div>
          <div className="flex gap-4 sm:justify-end">
            <Link className="text-sm text-zinc-700 hover:underline dark:text-zinc-300" href="/products">
              Products
            </Link>
            <Link className="text-sm text-zinc-700 hover:underline dark:text-zinc-300" href="/cart">
              Cart
            </Link>
            <Link className="text-sm text-zinc-700 hover:underline dark:text-zinc-300" href="/admin/orders">
              Admin
            </Link>
          </div>
          <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
            GSTIN: {business.gstin}
          </div>
        </div>
      </div>
    </footer>
  );
}

