# IssueSolved website

The site at issuesolved.ca. Next.js static export, Tailwind 4.

```bash
npm install
npm run dev          # local preview at http://localhost:3000
npm run build        # static site in build/
npm run check:voice  # em dashes and banned words in src/ and DESIGN.md
```

- `/` is the one page site. `/design-system` is the specimen, not linked and not indexed.
- Rules, tokens and components: `DESIGN.md`. Logo work in progress: `docs/design/`.
- Netlify builds from `netlify.toml` and deploys the `main` branch.
