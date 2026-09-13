import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const articles = JSON.parse(readFileSync(new URL('./articles.json', import.meta.url), 'utf8'));
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');
const formatDate = (value) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(value));

for (const [index, article] of articles.entries()) {
  const next = articles[(index + 1) % articles.length];
  const tags = article.categories.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  const directory = new URL(`../articles/${article.slug}/`, import.meta.url);
  mkdirSync(directory, { recursive: true });
  writeFileSync(new URL('index.html', directory), `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)} — Sagar Pandita</title>
    <meta name="description" content="${escapeHtml(article.excerpt)}" />
    <meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0b0d10" media="(prefers-color-scheme: dark)" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(article.title)}" />
    <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
    <meta property="article:published_time" content="${new Date(article.publishedAt).toISOString()}" />
    <link rel="canonical" href="https://sagarpandita.com/articles/${article.slug}/" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#article-content">Skip to article</a>
    <header class="article-site-header"><a href="/" aria-label="Sagar Pandita home">← Sagar Pandita</a><a href="/#writing">All writing</a></header>
    <main class="article-page" id="article-content">
      <header class="article-header">
        <div class="article-tags">${tags}</div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-deck">${escapeHtml(article.excerpt)}</p>
        <p class="article-byline">Sagar Pandita <span>·</span> ${formatDate(article.publishedAt)} <span>·</span> ${article.readingMinutes} min read</p>
      </header>
      <article class="article-body">${article.body}</article>
      <nav class="next-article" aria-label="Next article">
        <small>Continue reading</small>
        <a href="/articles/${next.slug}/">${escapeHtml(next.title)} →</a>
      </nav>
    </main>
    <footer class="site-footer"><div class="site-footer__inner"><span>© 2026 Sagar Pandita</span><a href="/#writing">Back to writing</a></div></footer>
  </body>
</html>\n`);
}

console.log(`Generated ${articles.length} article pages.`);
