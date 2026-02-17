export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(html: string): {
  updatedHtml: string;
  headings: HeadingItem[];
} {
  const headingRegex = /<(h[1-6])>(.*?)<\/\1>/gi;

  const headings: HeadingItem[] = [];
  let match;

  let updatedHtml = html;

  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1]; // h1, h2, etc
    const text = match[2].replace(/<[^>]*>/g, ""); // strip nested tags
    const level = parseInt(tag.replace("h", ""));

    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    headings.push({ id, text, level });

    // Inject ID into original HTML
    updatedHtml = updatedHtml.replace(
      `<${tag}>${match[2]}</${tag}>`,
      `<${tag} id="${id}" class="scroll-mt-24">${match[2]}</${tag}>`,
    );
  }

  return { updatedHtml, headings };
}
