import { business } from "@/lib/business";

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { orderId?: string };
}) {
  const { address, contacts } = business;
  const orderId = searchParams?.orderId?.trim();

  const orderEmailSubject = orderId ? `Order ${orderId} - Product issue` : "";
  const orderEmailBody = orderId
    ? [
        `Hi ${business.name},`,
        ``,
        `I want to report an issue with my order.`,
        `Order ID: ${orderId}`,
        ``,
        `Issue details:`,
        `- Product / item:`,
        `- Problem (defect/mismatch/damage):`,
        `- Photos (if any):`,
        ``,
        `Thanks,`,
      ].join("\n")
    : "";

  const orderEmailHref = orderId
    ? `mailto:${contacts.email}?subject=${encodeURIComponent(
        orderEmailSubject,
      )}&body=${encodeURIComponent(orderEmailBody)}`
    : `mailto:${contacts.email}`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
      {orderId ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          If you have an issue with your product, please include your order ID:{" "}
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{orderId}</span>
        </p>
      ) : null}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Address
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div>{business.name}</div>
            <div>{address.line1}</div>
            <div>{address.line2}</div>
            <div>
              {address.city} - {address.pincode}, {address.state}
            </div>
          </div>
          <a
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            href={business.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Call / Email
          </div>
          <div className="mt-2 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              Email:{" "}
              <a className="underline hover:no-underline" href={orderEmailHref}>
                {contacts.email}
              </a>
            </div>
            <div className="space-y-1">
              {contacts.phones.map((p) => (
                <div key={p.value}>
                  {p.label}:{" "}
                  <a className="underline hover:no-underline" href={`tel:${p.value.replace(/\s/g, "")}`}>
                    {p.value}
                  </a>
                </div>
              ))}
            </div>
            <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
              GSTIN: {business.gstin}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

