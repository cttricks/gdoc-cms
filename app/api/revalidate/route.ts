import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { isValidSlug, isCallbackHashValid } from '@/lib/google-cms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, secret } = body

    if (!slug || !secret) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter' },
        { status: 400 }
      )
    }

    if (!isCallbackHashValid(slug, secret)) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format', slug },
        { status: 400 }
      )
    }

    const path = slug.startsWith('/') ? slug : `/${slug}`

    // Invalidate route cache
    revalidatePath(path)

    // Keep sitemap-blogs.xml in sync with blog list changes
    if (path === '/blogs' || path.startsWith('/blogs/')) {
      revalidateTag('blogs')
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      now: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Endpoint Is Running Smoothly',
  })
}
