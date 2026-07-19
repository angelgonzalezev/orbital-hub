import { defineConfig } from 'vitepress';

// The site is emitted into the Next.js app's public/docs and served at
// orbitalhub.dev/docs through the rewrites in next.config.ts, which map
// /docs/<path> -> /docs/<path>.html. cleanUrls keeps the flat .html layout
// those rewrites expect, so pages must be named files (no index.md inside
// subdirectories) and slugs must not contain dots.
export default defineConfig({
  title: 'Orbital Docs',
  description: 'Discover startups orbiting the Solana ecosystem.',
  base: '/docs/',
  srcDir: 'docs',
  outDir: '../public/docs',
  cleanUrls: true,
  appearance: 'force-dark',
  vite: {
    // Stop Vite's upward search from picking up the Next.js app's
    // postcss.config.mjs (Tailwind), which is invalid in this context.
    css: { postcss: { plugins: [] } },
  },
  lastUpdated: false,
  sitemap: { hostname: 'https://orbitalhub.dev' },
  head: [
    // head entries are not base-processed, so the base is hardcoded here.
    ['link', { rel: 'icon', type: 'image/png', href: '/docs/img/orbital-logo.png' }],
  ],
  themeConfig: {
    siteTitle: 'Orbital',
    logo: '/img/orbital-logo.png',
    nav: [
      { text: 'Vision', link: '/vision' },
      { text: 'Roadmap', link: '/roadmap' },
      { text: 'App', link: 'https://orbitalhub.dev' },
    ],
    sidebar: [
      {
        text: 'Start here',
        items: [{ text: 'What is Orbital', link: '/' }],
      },
      {
        text: 'Vision & Roadmap',
        items: [
          { text: 'Vision', link: '/vision' },
          { text: 'Roadmap', link: '/roadmap' },
        ],
      },
      {
        text: 'Using Orbital',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'List your startup', link: '/guide/list-your-startup' },
          { text: 'Discover startups', link: '/guide/discover' },
          { text: 'Featured listings', link: '/guide/featured-listings' },
        ],
      },
      {
        text: 'About',
        items: [
          { text: 'Technology', link: '/about/technology' },
          { text: 'How we talk about Orbital', link: '/about/messaging' },
        ],
      },
    ],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/angelgonzalezev/orbital-hub' }],
    outline: [2, 3],
    footer: { copyright: 'Orbital HUB - By @angelgonzaleh' },
  },
});
