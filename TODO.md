# TODO — gdoc-cms

| Task | Priority | Description |
|------|----------|------------|
| Sitemap | High | Generate dynamic `sitemap.xml` for all published blogs to improve SEO and indexing. |
| RSS | Medium | Add `rss.xml` feed for blog posts to support subscriptions and aggregators. |
| Sheet Export | High | Use Google Sheets JSON export endpoint for blog list instead of Apps Script fetch (faster + fewer limits). |
| Auto Revalidate List | High | Automatically revalidate `/blogs` when publish/unpublish is triggered (no manual refresh action). |
| Tag Revalidation | Medium | Implement `revalidateTag()` for more granular cache control instead of only path-based revalidation. |
| Error Logging | Medium | Add structured logging for publish/revalidate failures (debug visibility). |
| Rate Limiting | Medium | Add basic rate limit to revalidation API to prevent abuse. |
| Draft Mode | Low | Add support for preview/draft mode before publishing. |
| Content Sanitization | High | Sanitize HTML output from Google Docs to prevent injection risks. |
| Slug Normalization | Medium | Enforce consistent slug format (auto-lowercase, remove invalid chars). |
| Pagination | Low | Add pagination support for `/blogs` when list grows. |
| Open Graph Defaults | Medium | Add fallback OG image + metadata defaults for missing fields. |
| Env Validation | Medium | Validate required environment variables on app start. |
| Tests | Low | Add minimal integration tests for API + slug validation logic. |
| Docs Setup Guide | High | Write complete setup guide for Google Sheet + Apps Script + Next.js integration. |

