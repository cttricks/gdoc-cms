import { cache } from "react";
import getDocHtml from "./doc-html";
import { getArticlesList, articleExists } from "./sheet-mapper";
import { isValidSlug, isCallbackHashValid } from "./validators";
import type { BlogMetadata, BlogContent } from "@/types/blog";
import { getRelatedArticles } from "./related-blogs";

export async function getArticles(endpoint: string): Promise<BlogMetadata[]> {
  if (!process.env.GOOGLE_SHEET_ID) throw new Error("CMS not configured - Missing GOOGLE_SHEET_ID");
  return getArticlesList();
}

export async function getArticle(slug: string, endpoint: string): Promise<BlogContent> {
  if (!isValidSlug(slug)) throw new Error("Invalid slug");

  const articles = await getArticlesList();
  const meta = articles.find((a) => a.slug === slug);
  if (!meta) throw new Error("Article not found");

  if (!meta.docId) throw new Error("No Doc ID in metadata");

  const html = await getDocHtml(meta.docId);

  const related = getRelatedArticles(articles, slug, 2);

  return { html, metadata: meta, related };
}

export const getCachedArticle = cache(getArticle);

export { isValidSlug, isCallbackHashValid, articleExists };
