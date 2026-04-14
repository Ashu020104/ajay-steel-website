import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <section className="grid gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ajay Steel Corporation
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Iron & steel traders since 1974. Browse items, add to cart, and place an order — we’ll
            confirm and deliver.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Browse products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-1 dark:from-zinc-200 dark:to-zinc-400">
          <div className="rounded-2xl bg-white p-6 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              We deal in
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              {[
                "Angles",
                "Channels",
                "Flats",
                "Round bars",
                "Square bars",
                "GP Pipe",
                "MS Pipe",
                "GP sheets",
                "CRC Sheets",
                "Profile Sheets",
              ].map((x) => (
                <li key={x} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
              Add to cart → Checkout → Order placed → We deliver.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
