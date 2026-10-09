import type { ReactNode } from "react";
import { DesktopBlocker } from "@/components/desktop-blocker";

export function VisitorFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-start justify-center">
      <div className="w-full max-w-md">{children}</div>
      <DesktopBlocker />
    </div>
  );
}
