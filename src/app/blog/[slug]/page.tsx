import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPostBySlug, getAllPosts, formatPostDate } from "@/lib/blog";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      ...(post.coverImage && { images: [{ url: post.coverImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    datePublished: post.date,
    ...(post.coverImage && { image: post.coverImage }),
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground"
          >
            ← Back to Blog
          </Link>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl leading-tight font-bold text-foreground sm:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
            <span>{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.content ?? "" }} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
