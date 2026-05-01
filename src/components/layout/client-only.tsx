"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount detection for SSR-safe render
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
