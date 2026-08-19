import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMins: number;
  category: string;
  body: string[];
  tags: string[];
  coverUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

function toPost(row: BlogPostRow): BlogPost {
  const body = row.body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const wordCount = row.body.split(/\s+/).filter(Boolean).length;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    date: row.published_at || row.created_at,
    readMins: Math.max(1, Math.ceil(wordCount / 200)),
    category: row.category || "General",
    body,
    tags: row.tags || [],
    coverUrl: row.cover_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load blog posts: ${error.message}`);
  }

  return ((data || []) as BlogPostRow[]).map(toPost);
}

export async function findPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load blog post: ${error.message}`);
  }

  return data ? toPost(data as BlogPostRow) : null;
}
