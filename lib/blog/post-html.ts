// Tidies a blog post's WYSIWYG HTML for the post page and extracts a table of contents.
//
// The posts were written in the control panel editor with their section titles as bold
// paragraphs (`<p><strong>Title</strong></p>`) rather than headings. For the page those become
// real `<h2>`s with anchor ids, so the "On this page" list can link to them and assistive tech
// gets a proper outline. Empty paragraphs and empty `<strong>` runs the editor leaves behind are
// dropped, and any `<h1>` inside the body steps down to `<h2>` (the page already has its h1).

export interface TocItem {
  id: string;
  text: string;
}

const EMPTY_STRONG = /<strong>\s*<\/strong>/gi;
const EMPTY_PARAGRAPH = /<p(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;
// A paragraph whose only content is one or more <strong> runs (the editor splits a title into
// several when it was typed in pieces).
const BOLD_PARAGRAPH = /<p(?:\s[^>]*)?>\s*((?:<strong>[^<]*<\/strong>\s*)+)<\/p>/gi;
const STRONG_TEXT = /<strong>([^<]*)<\/strong>/gi;
const BODY_H1 = /<(\/?)h1(\s[^>]*)?>/gi;
const H2 = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;
const TAGS = /<[^>]+>/g;

const decode = (text: string) =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&eacute;/g, 'é')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (text: string) =>
  decode(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section';

export function prepareBlogPostHtml(html: string): { html: string; toc: TocItem[] } {
  let out = html.replace(EMPTY_STRONG, '').replace(BODY_H1, '<$1h2$2>');

  out = out.replace(BOLD_PARAGRAPH, (_match, runs: string) => {
    const text = decode(
      Array.from(runs.matchAll(STRONG_TEXT))
        .map((m) => m[1] ?? '')
        .join(''),
    );

    // Not a title if it is empty or runs on like a sentence.
    if (text === '' || text.length > 90) return _match;

    return `<h2>${text}</h2>`;
  });

  out = out.replace(EMPTY_PARAGRAPH, '');

  const used = new Set<string>();
  const toc: TocItem[] = [];

  out = out.replace(H2, (_match, attrs: string | undefined, inner: string) => {
    const text = decode(inner.replace(TAGS, ''));
    let id = slugify(text);

    while (used.has(id)) id = `${id}-2`;
    used.add(id);
    toc.push({ id, text });

    const rest = (attrs ?? '').replace(/\sid=("|')[^"']*\1/i, '');

    return `<h2 id="${id}"${rest}>${inner}</h2>`;
  });

  return { html: out, toc };
}
