export interface BlogMetadata {
  slug: string;
  docId: string;
  title: string;
  keywords: string;
  description: string;
  status: "draft" | "published";
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  canonicalUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  twitterHandle?: string;
  author?: string;
  authorUrl?: string;
  authorImage?: string;
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
  tags?: string[];
  language?: string;
  readingTimeMinutes?: number;
  publisherName?: string;
  publisherLogo?: string;
}

export interface BlogContent {
  html: string;
  metadata: BlogMetadata;
  related?: BlogMetadata[];
}

export interface BlogsList {
  status: string;
  items: BlogMetadata[];
}
