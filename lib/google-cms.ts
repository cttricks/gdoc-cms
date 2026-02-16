import axios from "axios";
import crypto from "crypto";
import { cache } from "react";

const APPS_SCRIPT_DEPLOYMENT_ID = process.env.APPS_SCRIPT_DEPLOYMENT_ID || "";
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || "";
const CALLBACK_SECRET = process.env.CALLBACK_SECRET || "";

export interface BlogMetadata {
    slug: string;
    title: string;
    keywords: string;
    description: string;
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
}

export interface BlogsList {
    status: string;
    items: BlogMetadata[];
}

/**
 * Slug validation (same as before)
 */
export function isValidSlug(slug: string): boolean {
    const validSlugPattern = /^[a-zA-Z0-9_/-]+$/;

    if (!validSlugPattern.test(slug)) return false;
    if (slug.includes("..") || slug.includes("\\")) {
        return false;
    }

    return true;
}

/**
 * Callback Hash Composer & Validator
 */

export function isCallbackHashValid(input: string, hash: string): boolean {
    if (!CALLBACK_SECRET) return false;

    const localHash = crypto
        .createHash("sha256")
        .update(`${CALLBACK_SECRET}:${input}`)
        .digest("hex");

    return localHash === hash;
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
    slug: string,
    endpoint: string
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
                endpoint: endpoint,
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

export async function getArticles(
    endpoint: string
): Promise<BlogMetadata[]> {
    if (!APPS_SCRIPT_DEPLOYMENT_ID || !GOOGLE_SHEET_ID) {
        throw new Error("CMS not configured");
    }

    const { data } = await axios.get(
        `https://script.google.com/macros/s/${APPS_SCRIPT_DEPLOYMENT_ID}/exec`,
        {
            params: {
                endpoint: endpoint,
                source: GOOGLE_SHEET_ID,
            },
        }
    );

    if (!data || data.error) {
        return [];
    }

    const blogs = data as BlogsList;
    return blogs.items;

}

// This is to prevent multiple api-calls on same endpoint till next is composing the page
export const getCachedArticle = cache(
    async (slug: string, endpoint: string) => {
        return getArticle(slug, endpoint);
    }
);
