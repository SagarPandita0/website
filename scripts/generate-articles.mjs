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
  const tags = article.categories.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('\n          ');
  const articleBody = article.body.replaceAll('src="/media/', 'src="../../media/');
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
    <link rel="stylesheet" href="../../styles.css?v=medium-exit-2" />
    <style>
      html { overflow-x: hidden; }
      .article-site-header { display: flex; justify-content: space-between; gap: 1rem; }
      .article-site-header a { display: inline-block; }
      .article-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      main.article-page { width: 100%; max-width: 760px; margin-inline: auto; padding-inline: 1.5rem; }
      .article-header h1, .article-body, .next-article a { overflow-wrap: anywhere; }
      .article-footer-inner { display: flex; justify-content: space-between; gap: 1rem 2rem; flex-wrap: wrap; }
    </style>
  </head>
  <body>
    <a class="skip-link" href="#article-content">Skip to article</a>
    <header class="article-site-header">
      <a href="../../" aria-label="Sagar Pandita home">← Sagar Pandita</a>
      <a href="../../#writing">All writing</a>
    </header>
    <main class="article-page" id="article-content">
      <header class="article-header">
        <div class="article-tags">${tags}</div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-byline">Sagar Pandita <span>·</span> ${formatDate(article.publishedAt)} <span>·</span> ${article.readingMinutes} min read</p>
      </header>
      <article class="article-body">${articleBody}</article>
      <nav class="next-article" aria-label="Next article">
        <small>Continue reading</small>
        <a href="../${next.slug}/">${escapeHtml(next.title)} →</a>
      </nav>
    </main>
    <footer class="site-footer">
      <div class="site-footer__inner article-footer-inner">
        <span>© 2026 Sagar Pandita</span>
        <a href="../../#writing">Back to writing</a>
      </div>
    </footer>
    <script src="../../scripts/article-companion.js" defer></script>
  </body>
</html>\n`);
}

console.log(`Generated ${articles.length} article pages.`);
