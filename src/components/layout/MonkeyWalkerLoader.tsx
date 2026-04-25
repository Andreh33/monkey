"use client";

import dynamic from "next/dynamic";

const MonkeyWalker = dynamic(() => import("./MonkeyWalker"), {
  ssr: false,
});

export default function MonkeyWalkerLoader() {
  return <MonkeyWalker />;
}
