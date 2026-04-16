"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/enums";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function CancelOrderButton({
  orderId,
  status,
  cancellationEndsAt,
}: {
  orderId: string;
  status: OrderStatus;
  cancellationEndsAt: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Compute eligibility on the client (so the server component stays pure).
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const cancellationEndsAtMs = useMemo(
    () => new Date(cancellationEndsAt).getTime(),
    [cancellationEndsAt],
  );

  const remainingMs = useMemo(() => {
    if (nowMs === null) return 0;
    return cancellationEndsAtMs - nowMs;
  }, [cancellationEndsAtMs, nowMs]);

  const canCancel = useMemo(() => {
    if (status === "DELIVERED") return false;
    if (status === "CANCELLED") return false;
    if (nowMs === null) return false;
    return remainingMs > 0;
  }, [nowMs, remainingMs, status]);

  const reason = useMemo(() => {
    if (status === "DELIVERED") return "This order is already delivered, so it cannot be cancelled.";
    if (status === "CANCELLED") return "This order is already cancelled.";
    if (nowMs === null) return "Checking cancellation eligibility...";
    if (remainingMs <= 0) return "Cancellation window (24 hours) is over.";
    return "You can cancel this order within 24 hours of placement.";
  }, [remainingMs, nowMs, status]);

  const remainingText = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  async function onCancel() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/orders/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to cancel order.");
      }

      setSuccess("Order cancelled successfully.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Cancel order</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{reason}</div>
          {canCancel ? (
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              Time left: <span className="font-semibold">{remainingText}</span>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs text-zinc-500 dark:text-zinc-500">Current status</div>
          <div className="mt-1 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {status}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          disabled={!canCancel || loading}
          onClick={onCancel}
          className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 disabled:hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Cancelling..." : canCancel ? "Cancel this order" : "Cancellation not available"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-100">
          {success}
        </div>
      ) : null}
    </section>
  );
}

