import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Modern Blog',
  description: 'A production-ready blog built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="logo">Modern Blog</a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/about">About</a>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          {children}
        </main>
        
        <footer className="footer">
          <div className="footer-container">
            <p>&copy; {new Date().getFullYear()} Modern Blog. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
