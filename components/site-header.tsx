import type { ReactNode } from "react";
import Link from "next/link";

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 ${className ?? ""}`}
      aria-hidden
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-95"
      >
        <path
          d="M7 11V7a5 5 0 0110 0v4M6 11h12v10a1 1 0 01-1 1H7a1 1 0 01-1-1V11z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    </span>
  );
}

type SiteHeaderProps = {
  end?: ReactNode;
};

export function SiteHeader({ end }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-zinc-900 transition hover:opacity-90 dark:text-zinc-50"
        >
          <BrandMark />
          <span className="truncate">API Key Manager</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">{end}</div>
      </div>
    </header>
  );
}
