"use client";

import { usePathname } from "next/navigation";
import { NavRail } from "@/components/nav-rail";
import { ThemeToggle } from "@/components/theme-toggle";

const NO_CHROME_PATHS = ["/login", "/signup"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_CHROME_PATHS.includes(pathname)) {
    return (
      <div className="relative min-h-dvh">
        <div className="fixed right-4 top-4 z-30 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <NavRail />
      <div className="relative flex-1">
        <div className="fixed right-4 top-4 z-30 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
