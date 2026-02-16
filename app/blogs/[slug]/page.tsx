import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCachedArticle, articleExists, isValidSlug } from '@/lib/google-cms'
import { getBaseUrl } from '@/lib/site'

// Enable ISR
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
    const { metadata } = await getCachedArticle(slug, 'blog')
    const baseUrl = getBaseUrl()
    const canonicalUrl = metadata.canonicalUrl || `${baseUrl}/blogs/${slug}`

    const twitterCard = (metadata.twitterCard || 'summary_large_image') as
      | 'summary'
      | 'summary_large_image'
      | 'app'
      | 'player'

    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metadata.ogTitle || metadata.title,
        description: metadata.ogDescription || metadata.description,
        url: canonicalUrl,
        siteName: metadata.publisherName,
        locale: metadata.language,
        images: metadata.ogImage
          ? [
              {
                url: metadata.ogImage,
                alt: metadata.ogImageAlt || metadata.title,
              },
            ]
          : [],
        type: 'article',
        publishedTime: metadata.publishedAt,
        modifiedTime: metadata.modifiedAt,
        authors: metadata.author ? [metadata.author] : [],
      },
      twitter: {
        card: twitterCard,
        title: metadata.twitterTitle || metadata.ogTitle || metadata.title,
        description: metadata.twitterDescription || metadata.ogDescription || metadata.description,
        creator: metadata.twitterHandle,
        images: metadata.twitterImage
          ? [metadata.twitterImage]
          : metadata.ogImage
            ? [metadata.ogImage]
            : [],
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
    article = await getCachedArticle(slug, 'blog')
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error)
    notFound()
  }

  const { html, metadata } = article
  const baseUrl = getBaseUrl()
  const url = metadata.canonicalUrl || `${baseUrl}/blogs/${slug}`
  const images = metadata.ogImage ? [metadata.ogImage] : undefined
  const keywords = metadata.tags && metadata.tags.length > 0 ? metadata.tags.join(', ') : metadata.keywords

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.ogTitle || metadata.title,
    description: metadata.ogDescription || metadata.description,
    url,
    datePublished: metadata.publishedAt,
    dateModified: metadata.modifiedAt,
    author: metadata.author
      ? {
          '@type': 'Person',
          name: metadata.author,
          url: metadata.authorUrl,
          image: metadata.authorImage,
        }
      : undefined,
    publisher: metadata.publisherName
      ? {
          '@type': 'Organization',
          name: metadata.publisherName,
          logo: metadata.publisherLogo
            ? {
                '@type': 'ImageObject',
                url: metadata.publisherLogo,
              }
            : undefined,
        }
      : undefined,
    image: images,
    articleSection: metadata.section,
    keywords,
    inLanguage: metadata.language,
    timeRequired:
      typeof metadata.readingTimeMinutes === 'number'
        ? `PT${metadata.readingTimeMinutes}M`
        : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
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
