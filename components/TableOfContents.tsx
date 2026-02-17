"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // Smooth scroll with offset + visual feedback
  const scrollToHeading = useCallback((id: string) => {
    console.log("Scrolling to:", id); // Debug log

    const element = document.getElementById(id);
    if (!element) {
      console.warn("Element not found:", id);
      return;
    }

    const headerOffset = 120;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setActiveId(id);
  }, []);

  // Auto-scroll detection
  useEffect(() => {
    if (!headings.length) return;

    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];

      if (!headingElements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleHeadings = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio! - a.intersectionRatio!);

          if (visibleHeadings.length > 0) {
            setActiveId(visibleHeadings[0].target.id);
          }
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: [0.1, 0.5, 1],
        },
      );

      headingElements.forEach((el) => observer.observe(el));

      return () => {
        headingElements.forEach((el) => observer.unobserve(el));
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [headings]);

  if (!headings.length) return null;

  return (
    <div className="toc-wrapper" ref={tocRef}>
      <h4 className="toc-title">On this page</h4>
      <nav className="toc-nav" role="navigation" aria-label="Table of contents">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`toc-link level-${heading.level} ${activeId === heading.id ? "active" : ""}`}
            aria-label={`Scroll to ${heading.text}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                scrollToHeading(heading.id);
              }
            }}
          >
            <span className="toc-text">{heading.text}</span>
            <div className="active-indicator" />
          </button>
        ))}
      </nav>
    </div>
  );
}
