# Google Docs — CMS 

A lightweight blog system built using:

- **Google Docs** (content layer)
- **Google Sheets** (metadata layer)
- **Google Apps Script** (publish controller)
- **Next.js (App Router + ISR)** (render layer)

No database.  
No traditional CMS.  
No rebuild required when publishing.


## Why This Exists

I write 2–3 blog posts per month.

Adding a database, headless CMS, or markdown rebuild workflow felt unnecessary.

So I designed a system around tools I already use — Google Docs — and connected them to Next.js using secure on-demand revalidation.

👉 [Here](/WHY-THIS-EXISTS.md) is the full story.


## How It Works

1. Blog content is written in **Google Docs**.
2. Metadata (slug, SEO, status) is stored in **Google Sheets**.
3. A custom **Apps Script menu** allows:
   - Publish
   - Unpublish
   - Refresh blog list
4. On publish:
   - Apps Script generates a secure hash
   - Calls a Next.js API route
   - Triggers `revalidatePath()` for affected routes
5. Pages regenerate instantly via ISR.


## Architecture Overview

Content Layer → Google Docs  
Metadata Layer → Google Sheets  
Control Layer → Apps Script  
Rendering Layer → Next.js  
Cache Layer → ISR + Manual Revalidation  


## What This Optimizes

- No database cost
- No CMS dependency
- Static performance
- On-demand publishing
- Minimal infrastructure


## Tradeoffs

- Not designed for large-scale publishing
- Depends on Google ecosystem
- Requires structured metadata discipline

Built intentionally for small, low-frequency publishing workflows.


## Status

Repository is under active development.

More setup documentation will be added soon.