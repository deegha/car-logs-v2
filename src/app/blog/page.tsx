import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPaginatedPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Car buying guides, market insights, and tips for sellers in Sri Lanka.",
  openGraph: {
    title: "Blog | PrestigeRides",
    description: "Car buying guides, market insights, and tips for sellers in Sri Lanka.",
    type: "website",
  },
};

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, total, pages } = getPaginatedPosts(page, PAGE_SIZE);

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Blog</h1>
            <p className="mt-1 text-foreground-muted">
              Car buying guides, market insights, and seller tips.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="py-16 text-center text-foreground-muted">
              No posts yet — check back soon.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-foreground-muted">
                {total} {total === 1 ? "article" : "articles"}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </>
          )}

          {pages > 1 && <BlogPagination page={page} pages={pages} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BlogPagination({ page, pages }: { page: number; pages: number }) {
  function url(p: number) {
    return p === 1 ? "/blog" : `/blog?page=${p}`;
  }

  function getPageNumbers(): (number | "…")[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums: (number | "…")[] = [1];
    if (page > 3) nums.push("…");
    const lo = Math.max(2, page - 1);
    const hi = Math.min(pages - 1, page + 1);
    for (let i = lo; i <= hi; i++) nums.push(i);
    if (page < pages - 2) nums.push("…");
    nums.push(pages);
    return nums;
  }

  const btn =
    "flex h-9 items-center justify-center rounded-md border border-border bg-background text-sm hover:bg-background-subtle";

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={url(page - 1)}
        aria-disabled={page === 1}
        className={`${btn} w-9 ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        ←
      </Link>
      {getPageNumbers().map((p, i) =>
        p === "…" ? (
          <span
            key={`e-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-foreground-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={url(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} w-9 ${p === page ? "border-primary-600 bg-primary-600 font-semibold text-white hover:bg-primary-700" : ""}`}
          >
            {p}
          </Link>
        )
      )}
      <Link
        href={url(page + 1)}
        aria-disabled={page === pages}
        className={`${btn} w-9 ${page === pages ? "pointer-events-none opacity-40" : ""}`}
      >
        →
      </Link>
    </nav>
  );
}
