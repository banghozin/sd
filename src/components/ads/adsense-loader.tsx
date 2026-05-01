"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT = "ca-pub-5250094872537223";
const SCRIPT_ID = "adsbygoogle-loader";

export function AdSenseLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(s);
  }, []);
  return null;
}
