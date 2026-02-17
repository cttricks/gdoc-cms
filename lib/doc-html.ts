import { docs } from "./google-client";

async function getDocHtml(docId: string): Promise<string> {
  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body?.content || [];

  const inlineObjects = res.data.inlineObjects || {};

  function docToHtml(content: any[]): string {
    let html = "";
    let listBuffer: string[] = [];
    let currentListType: "ul" | "ol" | null = null;

    function flushList() {
      if (listBuffer.length > 0 && currentListType) {
        html += `<${currentListType}>${listBuffer.join("")}</${currentListType}>`;
        listBuffer = [];
        currentListType = null;
      }
    }

    for (const elem of content) {
      if (!elem.paragraph) continue;

      const paragraph = elem.paragraph;
      const elements = paragraph.elements || [];

      let text = elements
        .map((e: any) => {
          if (!e.textRun) return "";

          let content = e.textRun.content || "";
          content = content.replace(/\n/g, "");

          // Bold
          if (e.textRun.textStyle?.bold) {
            content = `<strong>${content}</strong>`;
          }

          // Italic
          if (e.textRun.textStyle?.italic) {
            content = `<em>${content}</em>`;
          }

          // Links or Images
          if (e.textRun.textStyle?.link?.url) {
            const url = e.textRun.textStyle.link.url;

            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

            if (isImage) {
              // Render as image instead of link
              return `<img src="${url}" alt="Article image" loading="lazy" class="w-full h-auto my-4 rounded-lg" />`;
            } else {
              content = `<a href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
            }
          }

          return content;
        })
        .join("");

      // Detect lists
      if (paragraph.bullet) {
        const nestingLevel = paragraph.bullet.nestingLevel || 0;
        const listType = paragraph.bullet.listId && nestingLevel === 0 ? "ul" : "ul";

        if (!currentListType) {
          currentListType = listType;
        }

        listBuffer.push(`<li>${text}</li>`);
        continue;
      }

      // If not list, flush previous list
      flushList();

      // Headings
      const headingLevel = paragraph.paragraphStyle?.namedStyleType || "NORMAL_TEXT";

      const headingMap: Record<string, string> = {
        TITLE: "h1",
        SUBTITLE: "h2",
        HEADING_1: "h1",
        HEADING_2: "h2",
        HEADING_3: "h3",
        HEADING_4: "h4",
        HEADING_5: "h5",
        HEADING_6: "h6",
      };

      const tag = headingMap[headingLevel] || "p";

      html += `<${tag}>${text}</${tag}>`;

      // Embedded Images
      if (elem.inlineObjects) {
        Object.entries(elem.inlineObjects).forEach(([key]) => {
          const imageObj = inlineObjects[key];
          const imgSrc = imageObj?.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri;

          if (imgSrc) {
            html += `<img src="${imgSrc}" alt="Article image" loading="lazy" />`;
          }
        });
      }
    }

    flushList();

    return `<div class="prose max-w-none">${html}</div>`;
  }

  return docToHtml(content);
}

export default getDocHtml;
