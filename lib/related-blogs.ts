import type { BlogMetadata } from "@/types/blog";

export function getRelatedArticles(articles: BlogMetadata[], currentSlug: string, count: number = 2): BlogMetadata[] {
  const index = articles.findIndex((a) => a.slug === currentSlug);

  if (index === -1) return [];

  const total = articles.length;

  // If first article → return next N
  if (index === 0) {
    return articles.slice(1, 1 + count);
  }

  // If last article → return previous N
  if (index === total - 1) {
    return articles.slice(Math.max(0, total - 1 - count), total - 1);
  }

  // Middle → return previous + next
  const related: BlogMetadata[] = [];

  if (articles[index - 1]) {
    related.push(articles[index - 1]);
  }

  if (articles[index + 1]) {
    related.push(articles[index + 1]);
  }

  return related.slice(0, count);
}
