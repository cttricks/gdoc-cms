import axios from "axios";

const APPS_SCRIPT_DEPLOYMENT_ID = process.env.APPS_SCRIPT_DEPLOYMENT_ID || "";
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || "";

export interface BlogMetadata {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    author?: string;
    publishedAt?: string;
}

export interface BlogContent {
    html: string;
    metadata: BlogMetadata;
}

/**
 * Slug validation (same as before)
 */
export function isValidSlug(slug: string): boolean {
    const validSlugPattern = /^[a-zA-Z0-9_-]+$/;

    if (!validSlugPattern.test(slug)) return false;
    if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
        return false;
    }

    return true;
}

/**
 * Now articleExists just checks:
 * 1. Env variables exist
 * 2. Slug valid
 * 3. Remote article exists - SKIP
 */
export async function articleExists(
    slug: string
): Promise<boolean> {
    if (!isValidSlug(slug)) return false;

    if (!APPS_SCRIPT_DEPLOYMENT_ID || !GOOGLE_SHEET_ID) {
        return false;
    }

    return true;

}

/**
 * Fetch article from Google CMS
 * Same return structure as file-based version
 */
export async function getArticle(
    slug: string
): Promise<BlogContent> {
    if (!isValidSlug(slug)) {
        throw new Error("Invalid slug");
    }

    if (!APPS_SCRIPT_DEPLOYMENT_ID || !GOOGLE_SHEET_ID) {
        throw new Error("CMS not configured");
    }

    const { data } = await axios.get(
        `https://script.google.com/macros/s/${APPS_SCRIPT_DEPLOYMENT_ID}/exec`,
        {
            params: {
                endpoint: "content",
                source: GOOGLE_SHEET_ID,
                slug,
            },
        }
    );

    if (!data || data.error) {
        throw new Error("Article not found");
    }

    const metadata = data.metadata as BlogMetadata;

    if (!metadata.title || !metadata.description) {
        throw new Error("Missing required metadata fields");
    }

    return {
        html: data.content,
        metadata,
    };
}
