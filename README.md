# OASIX Web Studio Portfolio

Final source code for the dark OASIX portfolio website.

Version 1.1.0. Live site: to be updated with the final Netlify address.

## Stack

- React 19 and TypeScript
- Next.js 16 App Router
- GSAP animations
- CSS glassmorphism, responsive layouts, and custom motion effects
- Static export, deployed on Netlify

## Features (v1)

- Home: animated hero with 3D glass sphere, services, featured work, process, testimonials
- Case studies: ZYPP Camera House and MINX in Motion, with a section index and click-to-zoom screenshots
- Projects archive with category and technology filters
- Three-step project brief form (Web3Forms), opened by every "Let's Talk" button
- Ctrl+K / Cmd+K command palette, custom cursor, copy-email toast, 404 page
- Per-project share images for social previews

## Configuration

- Contact form: the Web3Forms access key is in `app/components/ProjectBrief.tsx` (`WEB3FORMS_ACCESS_KEY`). It is public by design. Budget ranges are in the same file.
- Projects: edit `app/data.ts`. Images go in `public/assets/`. A share image (1200×630 JPG) is set per project with `shareImage`.
- Site address for social previews: `metadataBase` in `app/layout.tsx`.

## Requirements

- Node.js 22.13 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Production build

```bash
npm run build
```

`next build` writes the whole pre-rendered site to `out/`. To check it the way Netlify
serves it:

```bash
npm run start
```

## Deployment

Netlify, from the GitHub repository. The settings live in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `out`
- Node version: 22

The site is a static export, so the deploy has no serverless functions behind it. The
contact form posts straight from the browser to Web3Forms.

## Main files

- `app/page.tsx` — home page composition
- `app/HomeExperience.tsx` — home-page interactions and animation behavior
- `app/globals.css` — the complete visual system and responsive styling
- `app/components/HeroGlassCircle.tsx` — cursor-driven layered orb glow
- `app/components/SiteChrome.tsx` — navigation and global page chrome
- `app/data.ts` — services, projects, and portfolio content
- `app/projects/` — projects listing
- `app/project/[slug]/` — individual case-study routes
- `public/assets/` — OASIX branding, artwork, social icons, and project images

## Editing content

Update project and service information in `app/data.ts`. Replace visual assets in
`public/assets/` while keeping the same filenames, or update their paths in the
components that use them.

## Orb effect

The hero orb is implemented with four synchronized CSS glow layers:

- outer bloom
- clipped inner reflection
- luminous core
- localized highlight

`HeroGlassCircle.tsx` calculates the pointer angle with `atan2()` and uses GSAP
to interpolate the glow around the circumference with inertia.
