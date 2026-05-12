"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface MileageInputProps {
  label?: string;
  value: string;
  onChange: (raw: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

function formatKm(digits: string): string {
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (isNaN(n)) return "";
  return new Intl.NumberFormat("en-US").format(n);
}

export function MileageInput({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = "0",
  id,
  disabled,
  className,
}: MileageInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "").replace(/^0+(\d)/, "$1");
    onChange(raw);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger"> *</span>}
        </label>
      )}
      <div
        className={cn(
          "flex h-10 overflow-hidden rounded-md border bg-background transition-colors",
          error
            ? "border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20"
            : "border-border focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20",
          disabled && "opacity-50"
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={formatKm(value)}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="h-full flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none disabled:cursor-not-allowed"
        />
        <span className="flex select-none items-center border-l border-border bg-background-subtle px-3 text-sm font-medium text-foreground-muted">
          km
        </span>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
