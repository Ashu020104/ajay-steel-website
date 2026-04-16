"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/enums";
import { formatINRFromPaise } from "@/lib/money";

type OrderHistoryItem = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  city: string;
  pincode: string;
  subtotalPaise: number;
  itemsCount: number;
};

function statusPill(status: OrderStatus) {
  const base =
    "rounded-full px-3 py-1 text-xs font-semibold dark:text-zinc-900 dark:bg-zinc-100";
  switch (status) {
    case "PLACED":
      return `${base} bg-zinc-900 text-white dark:bg-zinc-100`;
    case "CONFIRMED":
      return `${base} bg-zinc-700 text-white dark:bg-zinc-100`;
    case "SHIPPED":
      return `${base} bg-indigo-600 text-white dark:bg-indigo-100`;
    case "DELIVERED":
      return `${base} bg-emerald-600 text-white dark:bg-emerald-100`;
    case "CANCELLED":
      return `${base} bg-red-600 text-white dark:bg-red-100`;
    default:
      return `${base} bg-zinc-900 text-white dark:bg-zinc-100`;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orderIdFromUrl, setOrderIdFromUrl] = useState<string>("");

  const autoTrackedRef = useRef(false);

  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get("orderId") ?? "";
    setOrderIdFromUrl(fromUrl);
  }, []);

  useEffect(() => {
    setTrackOrderId(orderIdFromUrl);
  }, [orderIdFromUrl]);

  async function trackByOrderId(id: string) {
    const trimmed = id.trim();
    if (!trimmed) {
      setTrackingError("Please enter an Order ID.");
      return;
    }
    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Order not found.");
      }
      router.push(`/orders/${trimmed}`);
    } catch (e) {
      setTrackingError(e instanceof Error ? e.message : "Order not found.");
    } finally {
      setTrackingLoading(false);
    }
  }

  useEffect(() => {
    if (!orderIdFromUrl) return;
    if (autoTrackedRef.current) return;
    autoTrackedRef.current = true;
    trackByOrderId(orderIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl]);

  const phoneNormalized = useMemo(() => phone.replace(/\s/g, ""), [phone]);

  async function loadHistory() {
    const p = phoneNormalized;
    setHistoryError(null);
    setOrders([]);

    if (!p || p.length < 6) {
      setHistoryError("Please enter your phone number.");
      return;
    }

    setHistoryLoading(true);
    try {
      const url = new URL("/api/orders/history", window.location.origin);
      // Pass raw user input (may include spaces); API will normalize and match past orders.
      url.searchParams.set("phone", phone);
      if (email.trim()) url.searchParams.set("email", email.trim());

      const res = await fetch(url.toString());
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to load order history.");
      }
      const data = (await res.json()) as { orders?: OrderHistoryItem[] };
      setOrders(data.orders ?? []);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "Failed to load order history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Track your order status, view order history, and cancel within 24 hours.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Track order</div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Order ID</span>
              <input
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
                placeholder="e.g. cuxxxxxxxx"
              />
            </label>

            {trackingError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
                {trackingError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => trackByOrderId(trackOrderId)}
              disabled={trackingLoading}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {trackingLoading ? "Tracking..." : "Track"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Order history</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            We’ll look up orders by your phone number (and optional email).
          </div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
                placeholder="+91 98242 31184"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email (optional)
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
                placeholder="you@example.com"
              />
            </label>

            {historyError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
                {historyError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {historyLoading ? "Loading..." : "Show my orders"}
            </button>
          </div>

          <div className="mt-6">
            {orders.length ? (
              <div className="space-y-3">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{o.customerName}</div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {o.city} - {o.pincode}
                        </div>
                        <div className="mt-2 font-mono text-xs text-zinc-500 dark:text-zinc-500">
                          {o.id}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className={statusPill(o.status)}>{o.status}</div>
                        <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {o.subtotalPaise > 0 ? formatINRFromPaise(o.subtotalPaise) : "Price on request"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{o.itemsCount} item(s)</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : historyLoading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Loading orders...
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                No orders found yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

