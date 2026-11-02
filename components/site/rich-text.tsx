import { sanitizeHtml } from "@/lib/sanitize";

// Renders CMS HTML. Always re-sanitized here, so rows written outside the CMS cannot inject markup.
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
