import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  coverImage?: string;
  tags: string[];
  readingTime: number;
  content?: string; // HTML — only populated by getPostBySlug
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8"));
      const words = content.trim().split(/\s+/).length;
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        author: String(data.author ?? "carlogs.lk"),
        coverImage: data.coverImage ? String(data.coverImage) : undefined,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        readingTime: Math.max(1, Math.ceil(words / 200)),
      } satisfies BlogPost;
    });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPaginatedPosts(page: number, pageSize: number) {
  const all = getAllPosts();
  const total = all.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, pages));
  return {
    posts: all.slice((safePage - 1) * pageSize, safePage * pageSize),
    total,
    page: safePage,
    pages,
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  const html = await marked(content, { breaks: true });
  const words = content.trim().split(/\s+/).length;

  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "carlogs.lk"),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    readingTime: Math.max(1, Math.ceil(words / 200)),
    content: html as string,
  };
}

export function formatPostDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
