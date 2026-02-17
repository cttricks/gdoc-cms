import { getArticles } from "@/lib/google-cms";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

export default async function Blogs() {
  const articles = await getArticles("blogs");

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Our Blog</h1>
        <p>Discover insightful articles, tutorials, and stories from our community of writers.</p>
      </div>

      <div className="blog-grid">
        {articles?.map((article) => (
          <Link key={article.slug} href={`/blogs/${article.slug}`} className="blog-card">
            <h2>{article.title}</h2>
            <p>{article.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
