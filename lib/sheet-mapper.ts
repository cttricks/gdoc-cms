import { BlogMetadata } from "@/types/blog";
import { sheets } from "./google-client";
import { isValidSlug } from "./validators";

export async function getArticlesList(): Promise<BlogMetadata[]> {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
  if (!SHEET_ID) throw new Error("CMS not configured - Missing GOOGLE_SHEET_ID");

  const range = "blogs!A2:O1000";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  console.log("rows:", res.data.values); // Keep for debugging

  const rows = res.data.values || [];

  return rows
    .map((row) => {
      while (row.length < 15) row.push("");

      return {
        // Core fields - exact column mapping
        slug: (row[0] || "").toString().trim(), // A: slug
        docId: (row[1] || "").toString().trim(), // B: doc_id
        title: (row[2] || "").toString().trim(), // C: title
        description: (row[3] || "").toString().trim(), // D: description
        keywords: (row[4] || "").toString().trim(), // E: keywords
        status: (row[5] || "draft").toString().trim(), // F: status

        // Derived SEO fields
        ogTitle: (row[2] || "").toString().trim(), // = title
        ogDescription: (row[3] || "").toString().trim(), // = description
        ogImage: (row[7] || "").toString().trim(), // H: og_image
        ogImageAlt: (row[2] || "").toString().trim(), // = title

        twitterTitle: (row[2] || "").toString().trim(), // = title
        twitterDescription: (row[3] || "").toString().trim(), // = description
        twitterImage: (row[7] || "").toString().trim(), // = og_image
        twitterCard: "summary_large_image" as const,

        // Author & dates
        author: (row[8] || "").toString().trim(), // I: author
        publishedAt: (row[9] || "").toString().trim(), // J: created_at
        modifiedAt: (row[10] || row[9] || "").toString().trim(), // K: updated_at

        // Tags & metadata
        tags: row[6]?.toString().trim() // G: tags
          ? row[6]
              .toString()
              .trim()
              .split(/[,;\s]+/)
              .map((t: any) => t.trim())
              .filter(Boolean)
          : [],
        language: (row[11] || "en").toString().trim(), // L: language
        readingTimeMinutes: row[12] ? parseInt(row[12].toString(), 10) : undefined, // M: read_time
        publisherName: (row[13] || "Your Site").toString().trim(), // N: publisher_name
        publisherLogo: (row[14] || "").toString().trim(), // O: publisher_logo
      };
    })
    .filter((meta) => {
      console.log("Filtering:", meta.slug, meta.status);
      return meta.status === "published" && meta.slug && meta.title && meta.docId && isValidSlug(meta.slug);
    });
}

export async function articleExists(slug: string): Promise<boolean> {
  if (!isValidSlug(slug)) return false;
  try {
    const articles = await getArticlesList();
    return articles.some((a) => a.slug === slug && a.status === "published");
  } catch {
    return false;
  }
}
