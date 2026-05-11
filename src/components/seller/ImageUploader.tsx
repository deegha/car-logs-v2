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
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function compress(file: File): Promise<File> {
  // Only compress files > 2 MB; keep smaller ones untouched
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

export function ImageUploader({ onChange, onUploadingChange, maxImages = 5 }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notify parent whenever images change
  useEffect(() => {
    const uploaded = images
      .filter((img) => img.status === "done" && img.cloudUrl)
      .map((img) => img.cloudUrl!);
    const uploading = images.some((img) => img.status === "uploading");
    onChange(uploaded);
    onUploadingChange(uploading);
  }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = maxImages - images.length;

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    // Snapshot into a plain array BEFORE resetting the input — resetting clears
    // e.target.files (it's a live reference), leaving an empty FileList.
    const snapshot = Array.from(e.target.files);
    e.target.value = "";
    await addFiles(snapshot);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) await addFiles(Array.from(e.dataTransfer.files));
  }

  async function addFiles(files: File[]) {
    // `file.type` is empty on iOS Safari / some Android browsers when picking from gallery,
    // so only reject files whose type is explicitly set to a non-image MIME type.
    // The `accept="image/*"` on the input already restricts the picker itself.
    const candidates = files.filter((f) => !f.type || f.type.startsWith("image/"));
    if (candidates.length === 0) return;

    // Cap inside the updater so we never exceed maxImages even on rapid calls
    setImages((prev) => {
      const slots = maxImages - prev.length;
      if (slots <= 0) return prev;
      const toAdd = candidates.slice(0, slots);
      const entries: ImageEntry[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
      }));
      // Kick off uploads after the state update is queued
      setTimeout(() => toAdd.forEach((file, i) => startUpload(entries[i].id, file)), 0);
      return [...prev, ...entries];
    });
  }

  async function startUpload(id: string, file: File) {
    // Validate size before compression
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

  function retry(id: string) {
    // Can't retry without the original file — just remove and re-add guidance
    remove(id);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Photos</p>
        <span className="text-xs text-foreground-muted">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-border bg-background-subtle"
          >
            {/* Preview — use Cloudinary URL once done (handles HEIC), else local blob */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.status === "done" && img.cloudUrl ? img.cloudUrl : img.previewUrl}
              alt={`Car photo ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Uploading overlay */}
            {img.status === "uploading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50">
                <svg className="h-6 w-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
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
                  className="h-5 w-5 text-red-400"
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
                  onClick={() => retry(img.id)}
                  className="rounded bg-white/20 px-2 py-0.5 text-[9px] font-medium text-white hover:bg-white/30"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Cover badge */}
            {i === 0 && img.status === "done" && (
              <span className="absolute top-1 left-1 rounded-sm bg-primary-600 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
                Cover
              </span>
            )}

            {/* Done indicator */}
            {img.status === "done" && (
              <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500/90">
                <svg
                  className="h-2.5 w-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}

            {/* Remove button (bottom-right, large tap target) */}
            <button
              type="button"
              onClick={() => remove(img.id)}
              disabled={img.status === "uploading"}
              className={cn(
                "absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-tl-lg bg-black/60 text-white transition-colors hover:bg-red-600/80 active:bg-red-700",
                img.status === "uploading" && "pointer-events-none opacity-0"
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

        {/* Add button — shown when below max */}
        {remaining > 0 && (
          <button
            type="button"
            onClick={openPicker}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-background-subtle text-foreground-muted transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100"
            aria-label="Add photos"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Helper text */}
      <p className="text-xs text-foreground-muted">
        Up to {maxImages} photos · JPEG, PNG, WebP, HEIC · 10 MB max each.{" "}
        <span className="text-foreground">First photo is the cover.</span>
      </p>

      {images.length === 0 && (
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-8 text-sm font-medium text-foreground-muted transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100 sm:py-12"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Tap to add photos
        </button>
      )}
    </div>
  );
}
