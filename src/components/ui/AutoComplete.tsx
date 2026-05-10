"use client"

import { useState, useRef, useEffect } from "react"

interface AutoCompleteProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export function AutoComplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  disabled,
}: AutoCompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : options

  const displayList = filtered.slice(0, 20)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [highlighted])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, displayList.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlighted >= 0 && displayList[highlighted]) {
        onChange(displayList[highlighted])
        setOpen(false)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setHighlighted(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={[
          "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-border focus:border-primary-500",
        ].join(" ")}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {open && displayList.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg"
        >
          {displayList.map((option, i) => (
            <li
              key={option}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(option)
                setOpen(false)
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={[
                "cursor-pointer px-3 py-2 text-sm",
                i === highlighted
                  ? "bg-primary-50 text-primary-700"
                  : "text-foreground hover:bg-background-subtle",
              ].join(" ")}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
