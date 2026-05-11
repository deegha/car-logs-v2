import Link from "next/link";
import Image from "next/image";
import { formatPostDate } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-background-subtle">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 text-border"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary-600">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-foreground-muted">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-foreground-muted">
          <span>{formatPostDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
