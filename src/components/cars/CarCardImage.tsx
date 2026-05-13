"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CarCardImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

export function CarCardImage({ src, alt, sizes, priority = false }: CarCardImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Shimmer placeholder — fades out once the image is ready */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          loaded ? "opacity-0" : "opacity-100"
        )}
        style={{
          background:
            "linear-gradient(90deg, var(--brand-border) 25%, var(--brand-background-subtle) 50%, var(--brand-border) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition-[opacity,transform] duration-300 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </>
  );
}
