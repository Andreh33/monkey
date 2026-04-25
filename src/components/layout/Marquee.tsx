"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
  itemClassName?: string;
};

export function Marquee({
  items,
  speed = 35,
  separator = "·",
  className,
  itemClassName,
}: MarqueeProps) {
  const repeated = [...items, ...items];
  return (
    <div className={cn("overflow-hidden w-full", className)}>
      <div
        className="marquee-track"
        style={{ ["--marquee-duration" as string]: `${speed}s` }}
      >
        {repeated.map((item, i) => (
          <div key={i} className={cn("flex items-center px-6 whitespace-nowrap", itemClassName)}>
            <span>{item}</span>
            <span className="ml-6 opacity-60">{separator}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
