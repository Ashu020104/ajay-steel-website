"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function AdminLogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        Signing out...
      </div>
    </main>
  );
}

