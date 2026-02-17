import { unstable_cache } from "next/cache";
import { getArticles } from "@/lib/google-cms";
import { getBaseUrl } from "@/lib/site";

const getCachedBlogs = unstable_cache(async () => getArticles("blogs"), ["sitemap-blogs"], { tags: ["blogs"] });

function toIsoDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function GET() {
  const baseUrl = getBaseUrl();
  const items = await getCachedBlogs();

  const urls = items
    .map((item) => {
      const lastmod = toIsoDate(item.publishedAt);
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      return `<url><loc>${baseUrl}/blogs/${item.slug}</loc>${lastmodTag}</url>`;
    })
    .join("");

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls +
    "</urlset>\n";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
