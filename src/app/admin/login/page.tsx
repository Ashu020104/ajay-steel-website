"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const callbackUrl = "/admin/orders";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Only for business owner to view and manage orders.
      </p>

      <form
        className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });
          if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
            return;
          }
          router.push(callbackUrl);
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mt-4 grid gap-1 text-sm">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</span>
          <input
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100/20"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

