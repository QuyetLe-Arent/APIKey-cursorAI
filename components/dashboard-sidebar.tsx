"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
      }`}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      {label}
    </Link>
  );
}

function NavLinkPlaceholder({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <div
      role="presentation"
      className="flex cursor-default select-none items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      {label}
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(true);
  const { data: session } = useSession();
  const initial =
    session?.user?.name?.charAt(0) ??
    session?.user?.email?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-30 flex h-screen flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-[width] duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/95 ${
          open ? "w-64" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex min-w-[16rem] flex-1 flex-col">
          <div className="border-b border-zinc-200/80 px-5 py-5 dark:border-zinc-800/80">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M7 11V7a5 5 0 0110 0v4M6 11h12v10a1 1 0 01-1 1H7a1 1 0 01-1-1V11z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                API Key Manager
              </span>
            </Link>
          </div>

          <nav className="mt-2 flex-1 space-y-0.5 px-2">
            <NavLink
              href="/keys"
              label="Overview"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <NavLink
              href="/playground"
              label="API Playground"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                </svg>
              }
            />
            <NavLinkPlaceholder
              label="Invoices"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <NavLinkPlaceholder
              label="Documentation"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </nav>

          {session?.user && (
            <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800/80">
              <div className="mb-3 flex items-center gap-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {session.user.name ?? "User"}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed top-4 z-40 flex size-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all duration-300 hover:bg-indigo-500 ${
          open ? "left-[15.5rem]" : "left-4"
        }`}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`}
        >
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}