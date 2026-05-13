"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";
import type { CarImage } from "@/types";

interface CarImageGalleryProps {
  images: CarImage[];
  title: string;
  edgeToEdge?: boolean;
}

export function CarImageGallery({ images, title, edgeToEdge = false }: CarImageGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.order - b.order;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const active = sorted[activeIndex];
  const stripRef = useRef<HTMLDivElement>(null);

  function selectImage(i: number) {
    if (i !== activeIndex) {
      setActiveIndex(i);
      setIsLoading(true);
    }
  }

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-background-subtle text-foreground-muted",
          edgeToEdge ? "aspect-[4/3]" : "aspect-video rounded-xl"
        )}
      >
        <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div
        className={cn(
          "relative overflow-hidden bg-background-subtle",
          edgeToEdge ? "aspect-[4/3] w-full" : "aspect-video rounded-xl"
        )}
      >
        <Image
          key={active.url}
          src={cloudinaryUrl(active.url, "w_1200,h_900,c_fill,g_auto")}
          alt={active.alt ?? title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
          onLoad={() => setIsLoading(false)}
        />

        {/* Loading shimmer */}
        {isLoading && (
          <div
            aria-hidden
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-border) 25%, var(--brand-background-subtle) 50%, var(--brand-border) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s ease-in-out infinite",
            }}
          />
        )}

        {/* Image counter dot indicator */}
        {sorted.length > 1 && (
          <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => selectImage(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div
          ref={stripRef}
          className={cn("scrollbar-hide flex gap-2 overflow-x-auto pb-1", edgeToEdge && "px-4")}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => selectImage(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === activeIndex
                  ? "border-primary-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={cloudinaryUrl(img.url, "w_200,h_150,c_fill,g_auto")}
                alt={img.alt ?? `${title} photo ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
