export default function HomePage() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Our Blog</h1>
        <p>Discover insightful articles, tutorials, and stories from our community of writers.</p>
      </div>
      
      <div className="blog-grid">
        <a href="/blogs/sample-article" className="blog-card">
          <h2>Sample Article</h2>
          <p>This is a sample article to demonstrate the blog system. Click to read more.</p>
        </a>
        
        <a href="/blogs/getting-started" className="blog-card">
          <h2>Getting Started</h2>
          <p>Learn how to create your first blog post with our file-based system.</p>
        </a>
        
        <a href="/blogs/advanced-features" className="blog-card">
          <h2>Advanced Features</h2>
          <p>Explore advanced features like caching, revalidation, and SEO optimization.</p>
        </a>
      </div>
    </div>
  )
}
