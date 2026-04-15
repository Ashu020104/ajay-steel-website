"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export function ActiveLink({
  href,
  children,
  exact,
}: LinkProps & { children: ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const hrefStr = typeof href === "string" ? href : href.pathname || "/";

  const isActive = exact
    ? pathname === hrefStr
    : pathname === hrefStr || pathname.startsWith(`${hrefStr}/`);

  return (
    <Link
      href={href}
      className={[
        "text-sm font-medium transition",
        isActive
          ? "text-zinc-900 underline underline-offset-8 dark:text-zinc-100"
          : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

