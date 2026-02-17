import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidSlug, isCallbackHashValid } from "@/lib/google-cms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, secret } = body;

    console.log("Revalidation request received", { slug, secret });

    if (!slug || !secret) {
      return NextResponse.json({ success: false, error: "Missing required parameter" }, { status: 400 });
    }

    if (!isCallbackHashValid(slug, secret)) {
      return NextResponse.json({ success: false, error: "Invalid secret" }, { status: 401 });
    }

    const path = slug.startsWith("/") ? slug : `/${slug}`;

    if (!isValidSlug(path)) {
      return NextResponse.json({ success: false, error: "Invalid slug format", slug: path }, { status: 400 });
    }

    // Example: /blogs/my-article
    // Split and extract parent segment
    const segments = path.split("/").filter(Boolean);

    if (segments.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid path structure" }, { status: 400 });
    }

    const parentPath = `/${segments[0]}`;

    console.log("Paths: ", path);
    console.log("Parent Path: ", parentPath);

    // Revalidate detail page
    revalidatePath(path);

    // Revalidate listing page
    revalidatePath(parentPath);

    // Optional: revalidate tag matching parent
    revalidateTag(segments[0]);

    return NextResponse.json({
      success: true,
      revalidated: true,
      path,
      parentPath,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ success: false, error: "Failed to revalidate" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Endpoint Is Running Smoothly",
  });
}
