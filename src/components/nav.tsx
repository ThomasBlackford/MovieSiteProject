"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Discover" },
  { href: "/journal", label: "Journal" },
  { href: "/u/demo", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/movies") : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="text-sm font-medium tracking-[0.14em]">
          REELNOTES
        </Link>
        <nav className="flex gap-5 text-[13px]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "link border-ink! text-ink!" : "link"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
