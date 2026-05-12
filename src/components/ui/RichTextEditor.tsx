"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  error,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[120px] px-3 py-2 text-sm text-foreground focus:outline-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-1",
          "[&_p]:mb-1 last:[&_p]:mb-0"
        ),
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-background",
          error
            ? "border-danger focus-within:ring-2 focus-within:ring-danger/20"
            : "border-border focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background-subtle px-2 py-1.5">
          {/* Heading */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive("heading", { level: 2 }) ?? false}
            title="Heading"
          >
            <IconHeading />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Bold */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold") ?? false}
            title="Bold"
          >
            <IconBold />
          </ToolbarButton>

          {/* Italic */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic") ?? false}
            title="Italic"
          >
            <IconItalic />
          </ToolbarButton>

          {/* Underline */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline") ?? false}
            title="Underline"
          >
            <IconUnderline />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Bullet list */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList") ?? false}
            title="Bullet list"
          >
            <IconBulletList />
          </ToolbarButton>

          {/* Ordered list */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList") ?? false}
            title="Numbered list"
          >
            <IconOrderedList />
          </ToolbarButton>
        </div>

        {/* Editor area */}
        <div className="relative">
          {!editor?.getText() && placeholder && (
            <p className="pointer-events-none absolute top-2 left-3 text-sm text-foreground-muted/50">
              {placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-sm transition-colors",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-foreground-muted hover:bg-background hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function IconHeading() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3v10M2 8h7M9 3v10M12 11h2M13 10v3" />
    </svg>
  );
}

function IconBold() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h5a2.5 2.5 0 010 5H4V3z" />
      <path d="M4 8h5.5a2.5 2.5 0 010 5H4V8z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="3" x2="6" y2="13" />
      <line x1="7" y1="3" x2="13" y2="3" />
      <line x1="3" y1="13" x2="9" y2="13" />
    </svg>
  );
}

function IconUnderline() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v5a4 4 0 008 0V3" />
      <line x1="2" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function IconBulletList() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="2.5" cy="4" r="0.75" fill="currentColor" stroke="none" />
      <line x1="5.5" y1="4" x2="14" y2="4" />
      <circle cx="2.5" cy="8" r="0.75" fill="currentColor" stroke="none" />
      <line x1="5.5" y1="8" x2="14" y2="8" />
      <circle cx="2.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <line x1="5.5" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function IconOrderedList() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="4" x2="14" y2="4" />
      <line x1="6" y1="8" x2="14" y2="8" />
      <line x1="6" y1="12" x2="14" y2="12" />
      <path d="M2.5 2.5v3" />
      <path d="M2 7.5c0-.8 1.5-.8 1.5 0s-1.5.8-1.5 1.5H4" />
      <path d="M2 11.5h1.5M2 13.5h2M3.5 11.5v2" />
    </svg>
  );
}
