"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { getYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";

type Img = { url: string; alt?: string | null };

export function ProductGallery({
  images,
  name,
  youtubeUrl,
}: {
  images: Img[];
  name: string;
  youtubeUrl?: string | null;
}) {
  const [active, setActive] = useState(0);
  const baseList: Img[] = images.length ? images : [{ url: "/imagenes/local-01.jpeg", alt: name }];
  const videoId = youtubeUrl ? getYoutubeId(youtubeUrl) : null;

  type Slide =
    | { kind: "image"; url: string; alt: string }
    | { kind: "video"; videoId: string; thumb: string; alt: string };

  const slides: Slide[] = [
    ...baseList.map<Slide>((img) => ({ kind: "image", url: img.url, alt: img.alt ?? name })),
    ...(videoId
      ? [
          {
            kind: "video" as const,
            videoId,
            thumb: getYoutubeThumbnail(videoId),
            alt: `${name} · review en YouTube`,
          },
        ]
      : []),
  ];

  const current = slides[active] ?? slides[0];

  return (
    <div className="flex flex-col-reverse gap-4 md:grid md:grid-cols-[80px_1fr]">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar px-1 md:px-0 md:flex-col md:gap-3 md:max-h-[600px] md:overflow-x-visible md:overflow-y-auto md:snap-none">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative w-16 h-16 shrink-0 snap-start md:w-auto md:h-auto md:aspect-square rounded-md overflow-hidden border-2 transition-all ${
              active === i ? "border-accent-red ring-2 ring-accent-red/40" : "border-border opacity-70 hover:opacity-100"
            }`}
            aria-label={s.kind === "video" ? "Video" : `Imagen ${i + 1}`}
          >
            <Image
              src={s.kind === "image" ? s.url : s.thumb}
              alt={s.alt}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized={s.kind === "video"}
            />
            {s.kind === "video" && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Play className="w-5 h-5 text-white fill-white" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="relative aspect-square sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-bg-secondary border border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {current.kind === "image" ? (
              <Image
                src={current.url}
                alt={current.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                style={{ filter: "saturate(1.1) contrast(1.05)" }}
              />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${current.videoId}?rel=0&modestbranding=1`}
                title={current.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
