"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageEntry {
  id: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  cloudUrl?: string;
  error?: string;
}

interface ImageUploaderProps {
  onChange: (cloudUrls: string[]) => void;
  onUploadingChange: (uploading: boolean) => void;
  maxImages?: number;
  initialImages?: string[];
  label?: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function compress(file: File): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) return file;
  return new Promise((resolve) => {
    const img = new window.Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const MAX_W = 1920;
      let { width, height } = img;
      if (width > MAX_W) {
        height = Math.round((height * MAX_W) / width);
        width = MAX_W;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) =>
          resolve(
            blob
              ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })
              : file
          ),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(file);
    };
    img.src = blobUrl;
  });
}

export function ImageUploader({
  onChange,
  onUploadingChange,
  maxImages = 5,
  initialImages,
  label = "Photos",
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageEntry[]>(() =>
    (initialImages ?? []).map((url) => ({
      id: `existing-${url}`,
      previewUrl: url,
      status: "done" as const,
      cloudUrl: url,
    }))
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // preparingIndex: item being long-pressed before drag activates
  const [preparingIndex, setPreparingIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const touchDragRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate refs so the distance check compares against the real start position
  const touchStartRef = useRef({ x: 0, y: 0 });
  const latestTouchRef = useRef({ x: 0, y: 0 });
  // Ghost DOM refs — manipulated directly to avoid React re-renders on every touchmove
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const uploaded = images
      .filter((img) => img.status === "done" && img.cloudUrl)
      .map((img) => img.cloudUrl!);
    const uploading = images.some((img) => img.status === "uploading");
    onChange(uploaded);
    onUploadingChange(uploading);
  }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = maxImages - images.length;
  const doneCount = images.filter((img) => img.status === "done").length;

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const snapshot = Array.from(e.target.files);
    e.target.value = "";
    await addFiles(snapshot);
  }

  async function handleGridDrop(e: React.DragEvent) {
    e.preventDefault();
    if (dragIndex !== null) return;
    if (e.dataTransfer.files.length > 0) await addFiles(Array.from(e.dataTransfer.files));
  }

  async function addFiles(files: File[]) {
    const candidates = files.filter((f) => !f.type || f.type.startsWith("image/"));
    if (candidates.length === 0) return;
    setImages((prev) => {
      const slots = maxImages - prev.length;
      if (slots <= 0) return prev;
      const toAdd = candidates.slice(0, slots);
      const entries: ImageEntry[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
      }));
      setTimeout(() => toAdd.forEach((file, i) => startUpload(entries[i].id, file)), 0);
      return [...prev, ...entries];
    });
  }

  async function startUpload(id: string, file: File) {
    if (file.size > MAX_FILE_BYTES) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: "error", error: "File too large (max 10 MB)" } : img
        )
      );
      return;
    }
    try {
      const compressed = await compress(file);
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, status: "error", error: data.error ?? "Upload failed" } : img
          )
        );
      } else {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, status: "done", cloudUrl: data.url } : img))
        );
      }
    } catch {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: "error", error: "Network error" } : img
        )
      );
    }
  }

  function remove(id: string) {
    setImages((prev) => {
      const entry = prev.find((img) => img.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }

  // ── Desktop drag-to-reorder ──────────────────────────────────────────────

  function handleDragStart(i: number) {
    setDragIndex(i);
  }

  function handleDragOverItem(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== i) setDragOverIndex(i);
  }

  function handleDropItem(e: React.DragEvent, i: number) {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  // ── Mobile touch drag — long press → ghost clone follows finger ──────────

  function cancelLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPreparingIndex(null);
  }

  function handleTouchStart(e: React.TouchEvent, i: number) {
    if (images[i].status !== "done") return;

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    latestTouchRef.current = { x: touch.clientX, y: touch.clientY };

    // Capture item geometry at touchstart (the element still at rest here)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const itemW = rect.width;
    const itemH = rect.height;
    const src = images[i].cloudUrl ?? images[i].previewUrl;

    setPreparingIndex(i);

    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;

      // Haptic pulse
      navigator.vibrate?.(40);

      touchDragRef.current = i;
      setPreparingIndex(null);
      setDragIndex(i);

      // Snapshot grid-item rects once so we can hit-test without elementFromPoint
      // (avoids having to hide the ghost to see through it)
      const itemEls = document.querySelectorAll("[data-img-index]");
      const rects = Array.from(itemEls).map((el) => el.getBoundingClientRect());

      // ── Show ghost ───────────────────────────────────────────────────────
      const ghost = ghostRef.current;
      const ghostImg = ghostImgRef.current;
      if (ghost && ghostImg) {
        ghostImg.src = src ?? "";
        ghost.style.width = itemW + "px";
        ghost.style.height = itemH + "px";

        const { x, y } = latestTouchRef.current;
        const tx = x - itemW / 2;
        const ty = y - itemH / 2;

        // Start small + transparent, then spring into "lifted" state
        ghost.style.display = "block";
        ghost.style.opacity = "0";
        ghost.style.transform = `translate(${tx}px,${ty}px) rotate(0deg) scale(0.88)`;
        ghost.style.transition =
          "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease";

        requestAnimationFrame(() => {
          ghost.style.opacity = "1";
          ghost.style.transform = `translate(${tx}px,${ty}px) rotate(4deg) scale(1.1)`;
          // After the entry spring settles, remove transform transition so
          // the ghost tracks the finger with zero lag
          setTimeout(() => {
            if (ghost) ghost.style.transition = "opacity 0.18s ease";
          }, 290);
        });
      }

      let currentOver: number | null = null;
      // Track last known position so the dismiss animation lands correctly
      let lastX = latestTouchRef.current.x;
      let lastY = latestTouchRef.current.y;

      function onMove(ev: TouchEvent) {
        ev.preventDefault(); // blocks scroll + image-selection default
        const t = ev.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;

        // Move ghost directly on the DOM (no React re-render → 60 fps)
        if (ghost) {
          ghost.style.transform = `translate(${t.clientX - itemW / 2}px,${t.clientY - itemH / 2}px) rotate(4deg) scale(1.1)`;
        }

        // Find which grid slot is under the finger using cached rects
        let found: number | null = null;
        for (let idx = 0; idx < rects.length; idx++) {
          const r = rects[idx];
          if (
            t.clientX >= r.left &&
            t.clientX <= r.right &&
            t.clientY >= r.top &&
            t.clientY <= r.bottom
          ) {
            if (idx !== touchDragRef.current) found = idx;
            break;
          }
        }
        if (found !== currentOver) {
          currentOver = found;
          setDragOverIndex(found);
        }
      }

      function onEnd() {
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
        document.removeEventListener("touchcancel", onEnd);

        // Dismiss ghost: shrink + fade to where the finger lifted
        if (ghost) {
          ghost.style.transition = "transform 0.18s ease, opacity 0.18s ease";
          ghost.style.opacity = "0";
          ghost.style.transform = `translate(${lastX - itemW / 2}px,${lastY - itemH / 2}px) rotate(0deg) scale(0.82)`;
          setTimeout(() => {
            if (ghost) ghost.style.display = "none";
          }, 190);
        }

        const from = touchDragRef.current;
        const to = currentOver;
        touchDragRef.current = null;
        if (from !== null && to !== null && from !== to) {
          setImages((prev) => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          });
        }
        setDragIndex(null);
        setDragOverIndex(null);
      }

      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onEnd);
      document.addEventListener("touchcancel", onEnd);
    }, 300);
  }

  function handleTouchMoveBeforeDrag(e: React.TouchEvent) {
    // If drag already active the document listener handles everything
    if (touchDragRef.current !== null) return;
    const t = e.touches[0];
    // Compare against start (not latestTouch) to measure total displacement
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    latestTouchRef.current = { x: t.clientX, y: t.clientY };
    // >10 px movement → user is scrolling, cancel the long press
    if (dx * dx + dy * dy > 100) cancelLongPress();
  }

  function handleTouchEndBeforeDrag() {
    // Short tap before 300 ms → cancel (document onEnd handles full drag release)
    cancelLongPress();
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Floating ghost clone — always in DOM, shown only during touch drag */}
      <div
        ref={ghostRef}
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow:
            "0 28px 72px rgba(0,0,0,0.5), 0 10px 28px rgba(0,0,0,0.35)",
          willChange: "transform",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ghostImgRef}
          alt=""
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {maxImages > 1 && (
            <p className="mt-0.5 text-xs text-foreground-muted/60">
              Landscape photos look best · previews below show exactly what buyers will see
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs text-foreground-muted">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) addFiles(Array.from(e.dataTransfer.files));
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-8 text-foreground-muted transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100 sm:py-10"
        >
          <svg className="h-7 w-7 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium">Tap to add photos</span>
          {maxImages > 1 && (
            <span className="text-xs opacity-60">
              Ideal: landscape 4:3 ratio (e.g. 1200 × 900 px) · JPEG, PNG, HEIC
            </span>
          )}
        </button>
      )}

      {/* Grid — aspect-[4/3] matches the CarCard display ratio so the preview is accurate */}
      {images.length > 0 && (
        <div
          className="grid grid-cols-3 gap-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleGridDrop}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              data-img-index={i}
              draggable={img.status === "done"}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOverItem(e, i)}
              onDrop={(e) => handleDropItem(e, i)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, i)}
              onTouchMove={handleTouchMoveBeforeDrag}
              onTouchEnd={handleTouchEndBeforeDrag}
              onContextMenu={(e) => e.preventDefault()}
              style={{ WebkitTouchCallout: "none", userSelect: "none" }}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-lg border bg-background-subtle transition-all duration-200",
                // Long-press preparing: press-in effect + glow ring
                preparingIndex === i &&
                  "scale-95 border-primary-400 ring-2 ring-primary-400/40",
                // Active drag source: dimmed placeholder
                dragIndex === i && "scale-90 opacity-25",
                // Drop target highlight
                dragOverIndex === i && dragIndex !== i
                  ? "scale-[1.04] border-primary-500 ring-2 ring-primary-400/50"
                  : preparingIndex !== i && dragIndex !== i && "border-border"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.status === "done" && img.cloudUrl ? img.cloudUrl : img.previewUrl}
                alt={`Car photo ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none", pointerEvents: "none" }}
              />

              {/* Uploading overlay */}
              {img.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50">
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-[10px] text-white">Uploading…</span>
                </div>
              )}

              {/* Error overlay */}
              {img.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-1 text-center">
                  <svg
                    className="h-4 w-4 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <p className="text-[9px] leading-tight text-red-300">{img.error ?? "Failed"}</p>
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-medium text-white hover:bg-white/30"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Top row: cover/number badge + drag handle */}
              {img.status === "done" && (
                <div className="absolute inset-x-1.5 top-1.5 flex items-start justify-between">
                  {i === 0 ? (
                    <span className="rounded-sm bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                      Cover
                    </span>
                  ) : (
                    <span className="rounded-sm bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white/80">
                      {i + 1}
                    </span>
                  )}
                  {maxImages > 1 && (
                    // Always visible on mobile (no hover); hidden until hover on desktop
                    <span className="cursor-grab rounded bg-black/40 p-1 opacity-70 transition-opacity active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="5" cy="3" r="1.2" />
                        <circle cx="11" cy="3" r="1.2" />
                        <circle cx="5" cy="8" r="1.2" />
                        <circle cx="11" cy="8" r="1.2" />
                        <circle cx="5" cy="13" r="1.2" />
                        <circle cx="11" cy="13" r="1.2" />
                      </svg>
                    </span>
                  )}
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(img.id)}
                disabled={img.status === "uploading"}
                className={cn(
                  "absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-tl-lg bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600/80 active:bg-red-700",
                  img.status === "uploading" && "pointer-events-none"
                )}
                aria-label="Remove photo"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          {/* Add more */}
          {remaining > 0 && (
            <button
              type="button"
              onClick={openPicker}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-background-subtle text-foreground-muted transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100"
              aria-label="Add photos"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Reorder hint */}
      {doneCount >= 2 && maxImages > 1 && (
        <p className="text-xs text-foreground-muted/60">
          Hold &amp; drag to reorder · first photo is the cover
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileInput}
        aria-hidden="true"
      />

      {/* Footer */}
      <p className="text-xs text-foreground-muted">
        Up to {maxImages} {maxImages === 1 ? "photo" : "photos"} · JPEG, PNG, WebP, HEIC · 10 MB max
        each
      </p>
    </div>
  );
}
