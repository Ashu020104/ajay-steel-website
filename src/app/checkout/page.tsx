"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useCartStore } from "@/lib/cart-store";
import { formatINRFromPaise } from "@/lib/money";

const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(4, "Pincode is required"),
  notes: z.string().optional().or(z.literal("")),
});

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0),
    [items],
  );

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "Rajkot",
    pincode: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Your cart is empty. Please add products first.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Fill delivery details and place your order. We’ll confirm and deliver.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const parsed = CheckoutSchema.safeParse(form);
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message ?? "Please check the form.");
              return;
            }

            setLoading(true);
            try {
              const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  customer: parsed.data,
                  items,
                }),
              });
              const data = (await res.json()) as { orderId?: string; error?: string };
              if (!res.ok || !data.orderId) throw new Error(data.error || "Order failed");
              clear();
              router.push(`/order/success/${data.orderId}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Order failed");
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Full name"
              value={form.customerName}
              onChange={(v) => setForm((s) => ({ ...s, customerName: v }))}
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            />
            <Field
              label="Email (optional)"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            />
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm((s) => ({ ...s, city: v }))}
            />
            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(v) => setForm((s) => ({ ...s, pincode: v }))}
            />
          </div>
          <div className="mt-4 grid gap-4">
            <Field
              label="Address line 1"
              value={form.addressLine1}
              onChange={(v) => setForm((s) => ({ ...s, addressLine1: v }))}
            />
            <Field
              label="Address line 2 (optional)"
              value={form.addressLine2}
              onChange={(v) => setForm((s) => ({ ...s, addressLine2: v }))}
            />
            <Field
              label="Notes (optional)"
              value={form.notes}
              onChange={(v) => setForm((s) => ({ ...s, notes: v }))}
              textarea
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Order items</div>
          <div className="mt-3 space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{i.name}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Qty: {i.quantity}</div>
                </div>
                <div className="shrink-0 font-semibold">
                  {i.unitPaise > 0 ? formatINRFromPaise(i.unitPaise * i.quantity) : "—"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
            <span>Subtotal</span>
            <span className="font-semibold">
              {subtotal > 0 ? formatINRFromPaise(subtotal) : "Price on request"}
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      {textarea ? (
        <textarea
          className="min-h-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

