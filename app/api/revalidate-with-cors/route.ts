/*
 * This file is just an addon of CORS handler on revalidate/route.ts
 * So when request arrive on webhook.site it'll send it to localhost:3000 at this path
 * i.e. http://localhost:3000/api/revalidate-with-cors
 *
 * Why?
 * When we do Publish/Unpublish/Refresh call from Google Sheet this happens
 * Google Sheet -> App Script -> WebhookSite -> Localhost XD Pure Magic
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidSlug, isCallbackHashValid } from "@/lib/google-cms";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, secret } = body;

    if (!slug || !secret) {
      return withCors(NextResponse.json({ success: false, error: "Missing required parameter" }, { status: 400 }));
    }

    if (!isCallbackHashValid(slug, secret)) {
      return withCors(NextResponse.json({ success: false, error: "Invalid secret" }, { status: 401 }));
    }

    if (!isValidSlug(slug)) {
      return withCors(NextResponse.json({ success: false, error: "Invalid slug format", slug }, { status: 400 }));
    }

    revalidatePath(slug);

    return withCors(
      NextResponse.json({
        success: true,
        revalidated: true,
        now: Date.now(),
      }),
    );
  } catch (error) {
    console.error("Revalidation error:", error);

    return withCors(NextResponse.json({ success: false, error: "Failed to revalidate" }, { status: 500 }));
  }
}

export async function GET() {
  return withCors(
    NextResponse.json({
      message: "API Endpoint Is Running Smoothly",
    }),
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
