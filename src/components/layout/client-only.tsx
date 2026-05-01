"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer one animation frame so the parent containers have already
    // been laid out by the browser. Prevents Recharts from logging the
    // -1x-1 warning on its first measurement.
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
