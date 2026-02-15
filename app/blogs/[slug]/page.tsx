import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticle, articleExists, isValidSlug } from '@/lib/google-cms'

// Enable ISR (1 hour)
export const dynamic = "force-static"
export const revalidate = false;
export const dynamicParams = true

interface BlogPageProps {
  params: {
    slug: string
  }
}

/**
 * Generate SEO metadata dynamically
 */
export async function generateMetadata(
  { params }: BlogPageProps
): Promise<Metadata> {
  const { slug } = params

  if (!isValidSlug(slug)) {
    return { title: 'Invalid Article' }
  }

  const exists = await articleExists(slug)
  if (!exists) {
    return { title: 'Article Not Found' }
  }

  try {
    const { metadata } = await getArticle(slug)

    return {
      title: metadata.title,
      description: metadata.description,
      openGraph: {
        title: metadata.ogTitle || metadata.title,
        description: metadata.ogDescription || metadata.description,
        images: metadata.ogImage ? [metadata.ogImage] : [],
        type: 'article',
        publishedTime: metadata.publishedAt,
        authors: metadata.author ? [metadata.author] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.ogTitle || metadata.title,
        description: metadata.ogDescription || metadata.description,
        images: metadata.ogImage ? [metadata.ogImage] : [],
      },
    }
  } catch {
    return { title: 'Error Loading Article' }
  }
}

/**
 * Blog page (Server Component)
 * Cached at route level via ISR
 */
export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params

  if (!isValidSlug(slug)) {
    notFound()
  }

  const exists = await articleExists(slug)
  if (!exists) {
    notFound()
  }

  let article
  try {
    article = await getArticle(slug)
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error)
    notFound()
  }

  const { html, metadata } = article

  return (
    <article>
      <header className="article-header">
        <h1>{metadata.title}</h1>

        {metadata.author && (
          <div className="article-meta">
            By {metadata.author}
            {metadata.publishedAt &&
              ` • ${new Date(metadata.publishedAt).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              )}`}
          </div>
        )}
      </header>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}
