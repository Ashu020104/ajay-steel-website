import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINRFromPaise } from "@/lib/money";
import { business } from "@/lib/business";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import type { OrderStatus } from "@/generated/prisma/enums";

const MS_24_HOURS = 24 * 60 * 60 * 1000;

const statusSteps: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  { status: "PLACED", label: "Order received", description: "We received your order." },
  { status: "CONFIRMED", label: "Order confirmed", description: "Our team confirmed the order." },
  { status: "SHIPPED", label: "Shipped", description: "Your order is on the way." },
  { status: "DELIVERED", label: "Delivered", description: "Order delivered successfully." },
  { status: "CANCELLED", label: "Cancelled", description: "Order cancelled." },
];

function getStatusStep(orderStatus: OrderStatus) {
  return statusSteps.find((s) => s.status === orderStatus) ?? statusSteps[0];
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return notFound();

  const subtotalPaise = order.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0);

  const createdAtMs = new Date(order.createdAt).getTime();
  const cancellationEndsAt = new Date(createdAtMs + MS_24_HOURS).toISOString();

  const currentStep = getStatusStep(order.status);
  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);

  const issueEmailSubject = `Order ${order.id} - Product issue`;
  const issueEmailBody = [
    `Hi ${business.name},`,
    ``,
    `I want to report an issue with my order.`,
    `Order ID: ${order.id}`,
    `Current status: ${order.status}`,
    `Customer name: ${order.customerName}`,
    ``,
    `Issue details:`,
    `- Product / item:`,
    `- Problem (defect/mismatch/damage):`,
    `- Photos (if any):`,
    ``,
    `Thanks,`,
  ].join("\n");

  const issueMailtoHref = `mailto:${business.contacts.email}?subject=${encodeURIComponent(
    issueEmailSubject,
  )}&body=${encodeURIComponent(issueEmailBody)}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Track order</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Order is at:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentStep.label}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 dark:text-zinc-500">Order ID</div>
            <div className="mt-1 font-mono text-sm">{order.id}</div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              Placed: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm font-semibold">Order progress</div>
            <div className="mt-4 space-y-3">
              {statusSteps.map((s, idx) => {
                const done = idx <= currentStepIndex && order.status !== "CANCELLED";
                const isCurrent = s.status === order.status;
                return (
                  <div
                    key={s.status}
                    className={[
                      "flex items-start justify-between gap-4 rounded-xl border p-4",
                      isCurrent
                        ? "border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950"
                        : "border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/40",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{s.label}</div>
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {s.description}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {isCurrent ? (
                        <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                          Current
                        </div>
                      ) : done ? (
                        <div className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                          Done
                        </div>
                      ) : (
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-400 dark:ring-zinc-800">
                          Pending
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
              Last updated: {new Date(order.updatedAt).toLocaleString()}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Summary</div>
            <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">Customer</span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">Delivery</span>
                <span className="font-semibold">
                  {order.city} - {order.pincode}
                </span>
              </div>
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                <span className="font-semibold">
                  {subtotalPaise > 0 ? formatINRFromPaise(subtotalPaise) : "Price on request"}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
              If you have an issue with the product, use the contact button below.
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Items</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {order.items.length} product type(s)
              </div>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              Continue shopping
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {order.items.map((i) => (
              <div
                key={i.id}
                className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-14 w-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-950">
                  <img
                    src={i.imageUrl}
                    alt={i.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{i.productName}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Qty: {i.quantity}</div>
                </div>
                <div className="shrink-0 text-right text-xs font-semibold">
                  {i.unitPaise > 0 ? formatINRFromPaise(i.unitPaise * i.quantity) : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <CancelOrderButton
              orderId={order.id}
              status={order.status}
              cancellationEndsAt={cancellationEndsAt}
            />
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Product default / issue</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              If your product is defective, damaged, or incorrect, contact us and mention your order ID.
            </div>

            <div className="mt-4 space-y-3">
              <a
                className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                href={issueMailtoHref}
              >
                Email about this order
              </a>
              <a
                className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                href={`tel:${business.contacts.phones[0]?.value.replace(/\s/g, "")}`}
              >
                Call {business.contacts.phones[0]?.label}
              </a>
            </div>

            <div className="pt-4 text-xs text-zinc-500 dark:text-zinc-500">
              You can also use the general contact page:{" "}
              <Link
                className="underline hover:no-underline"
                href={`/contact?orderId=${order.id}`}
              >
                Contact
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Track another order
          </Link>
          {order.status === "CANCELLED" ? (
            <div className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              This order is cancelled
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

