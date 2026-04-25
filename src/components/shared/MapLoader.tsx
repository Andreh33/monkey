"use client";

import dynamic from "next/dynamic";

const ShopMap = dynamic(() => import("./Map").then((m) => m.ShopMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-2xl border border-border bg-bg-secondary animate-pulse" />
  ),
});

export default function MapLoader() {
  return <ShopMap />;
}
