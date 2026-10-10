# cyberskell.com — Ethan Haskell's Portfolio

A single-page portfolio site built with plain HTML, CSS, and JavaScript — no build
step, no framework, no dependencies to install. Open `index.html` in a browser and
it runs.

**Live site:** https://cyberskell.com
**Repo:** https://github.com/cyberskell/portfolio

## What's here

```
index.html            All page content and structure (Home, About, Projects, Résumé, Contact)
css/style.css          Design system + component styles
js/script.js           Navigation, scroll-spy, hero diagram animation, contact form
js/chatbot.js          The FAQ chatbot (logic + UI)
assets/qr-code.png      QR code linking to cyberskell.com
assets/Ethan_Haskell_Resume.pdf   Downloadable / embeddable résumé
assets/Ethan_Haskell_Resume.docx  Editable source of the résumé
scripts/build_resume.js Node script that generates the résumé (docx) from scratch
CNAME                  Tells GitHub Pages which custom domain to serve
```

## Design concept

The site borrows its visual language from the subject matter: network topology
diagrams, schematic "spec plates," and the amber of an instrument panel signal
light. The hero section renders an actual small network diagram (Internet →
Firewall → Router → Proxmox host / DNS+VPN / Workstation) that draws itself in on
load — a simplified version of the home lab described in the Projects section.

## How the chatbot works

It's a **rule-based FAQ bot**, entirely client-side, in `js/chatbot.js` — no API
key, no external service, no network request, so it works instantly and never
goes down.

1. A small knowledge base is a list of `{ triggers: [...], answer: "..." }`
   entries covering skills, projects, experience, education, certifications,
   leadership, contact info, résumé, and location.
2. When a message comes in, it's lowercased and checked against every entry's
   trigger list. Each matching trigger adds to that entry's score (multi-word
   triggers score higher, so more specific matches win over generic ones).
3. The highest-scoring entry's canned answer is returned. If nothing scores
   above zero, a fallback message points the user toward what it *does* know.

This keyword-scoring approach (rather than exact string matching) is what lets it
handle paraphrased questions — "what's your tech stack?" and "what do you know?"
both correctly hit the skills answer, for example — while staying completely
free and dependency-free.

**Want a smarter, LLM-powered version later?** The swap is small: replace the
body of `getAnswer()` in `js/chatbot.js` with a `fetch()` call to whatever API
you're using, passing the résumé content as
context. Everything else — the UI, the suggestion chips, the message
rendering — stays the same.

## Updating content

- **Resume text:** edit `scripts/build_resume.js` and re-run `node
  build_resume.js` from inside `scripts/` (requires Node + the `docx` npm
  package: `npm install docx`). It regenerates the `.docx`; convert to PDF with
  any Word-to-PDF tool or LibreOffice (`soffice --headless --convert-to pdf
  Ethan_Haskell_Resume.docx`).
- **Site copy:** all text lives directly in `index.html` — no CMS, no data
  file, just edit the HTML.
- **Chatbot answers:** edit the `KB` array at the top of `js/chatbot.js`.
- **After changing CSS or JS:** bump the `?v=` number on the stylesheet and
  script tags in `index.html` (e.g. `?v=20261010` → `?v=20261115`). Otherwise
  visitors' browsers may keep using the old cached file.
- **Project links:** the self-hosted web server links to
  `github.com/cyberskell/cyberskell-web-dns-server`. The home lab and Pi
  cluster cards still point to the profile (`github.com/cyberskell`) as a
  placeholder — swap in their specific repo URLs once pushed (search
  `index.html` for `proj-link`).

## Keeping this resume current

This is meant to be a living document, tailored per job application rather
than rewritten from scratch each time:

- **Master content** lives in `scripts/build_resume.js` (the résumé) and
  directly in `index.html` (the site). There's no separate data file — the
  script's sequence of `skillLine(...)` / `bullet(...)` / `roleHeader(...)`
  calls *is* the content, in the order it prints.
- **Adding a new internship or job:** add a new `roleHeader(...)` +
  `subLine(...)` + `bullet(...)` block under "Work Experience" in
  `build_resume.js` (most recent first), and a matching card in the `proj-grid`
  in `index.html`. Re-run the build steps above afterward.
- **Swapping résumé projects:** every project lives in the `PROJECTS` library
  near the top of `scripts/build_resume.js` (`homelab`, `wireguard`,
  `webserver`, `azure`, `hpc`). Change `SELECTED_PROJECTS` to pick which
  ones print and in what order, then rebuild. The website always shows all
  of them. Three projects is about the limit for one page.
- **Tailoring to a specific posting:** when applying somewhere, the highest-
  leverage edits are (1) the order of the `skillLine(...)` entries — put the
  categories the posting cares about first, (2) which 2–3 project/experience
  bullets get kept vs. trimmed, and (3) the Summary paragraph's first
  sentence, which should echo the posting's own language where it's true.
  None of this needs new infrastructure — it's the same file, edited per
  application. Keep a copy of the resulting PDF named for the employer
  (e.g. `Ethan_Haskell_Resume_CompanyName.pdf`) if you want to keep multiple
  tailored versions side by side rather than overwriting the one on the site.
- **Placeholder dates:** any work-experience entry with `[dates — confirm]`
  in place of real dates is a flag that it was added from a job description
  without confirmed start/end dates — fill those in before sending the resume
  out.

## Making the contact form send silently (optional)

Right now the contact form opens the visitor's email client with the message
pre-filled — it works with zero backend, which is why it's the default for a
static GitHub Pages site. If you'd rather it submit invisibly:

1. Create a free form at [formspree.io](https://formspree.io) and grab your
   form endpoint.
2. In `index.html`, change the `<form id="contactForm">` tag to `<form
   id="contactForm" action="https://formspree.io/f/yourFormId" method="POST">`.
3. In `js/script.js`, delete the `e.preventDefault()` line inside the
   `contactForm` submit handler (or remove the handler entirely) so the form
   submits normally to Formspree instead of building a `mailto:` link.

## Deploying on GitHub Pages with your own domain

1. Push this folder's contents to a repo named `portfolio` (or anything you
   like) under your GitHub account.
2. In the repo, go to **Settings → Pages**, set the source branch to `main`
   (root), and save.
3. Still in **Settings → Pages**, add `cyberskell.com` under "Custom domain."
   GitHub will detect the `CNAME` file already in this repo and use it.
4. In Squarespace's domain DNS settings for cyberskell.com, add:
   - Four **A** records for `@` pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - One **CNAME** record for `www` pointing to `cyberskell.github.io`
5. DNS can take anywhere from a few minutes to a few hours to propagate. Once
   it does, check "Enforce HTTPS" back in GitHub Pages settings.

## Browser support

Built with modern CSS (Grid, Flexbox, custom properties) and vanilla JS — no
transpiling needed for any browser released in the last several years.
`prefers-reduced-motion` is respected throughout.
