# Cool... Here is the full picture of Why i made a CMS with Google Docs + Next.js

I didn’t want a database.  
I didn’t want markdown rebuilds.  
I didn’t want Notion as a CMS.  
And I definitely didn’t want to pay for something I’d use 2–3 times a month.

So I built my own blog system.

And it runs entirely on:

- Google Docs
- Google Sheets
- Google Apps Script
- Next.js (ISR + manual revalidation)

No database.  
No CMS.  
No rebuild on publish.

## The Problem

My website was a static Next.js build.

When I decided to add blogs, every solution felt heavy:

- **Markdown + rebuild** → redeploy every time
- **Database** → infra + cost + complexity
- **Headless CMS** → overkill for my usage
- **Notion API** → friction in writing

I don’t write daily.  
I write 2–3 blogs per month.

Why should I introduce an entire backend for that?

## The Idea 💡

I already write everything in Google Docs.

So I asked:

> What if Google Docs _is_ my CMS?

That single question changed everything.

## The Architecture

Instead of adding infrastructure, I layered responsibilities:

### 📝 Google Docs → Content Layer

Where I actually write.

### 📊 Google Sheets → Metadata Layer

Slug, SEO, status, timestamps.

### ⚙ Google Apps Script → Publish Controller

Custom menu:

- Publish
- Unpublish
- Refresh blog list

It updates sheet status and triggers a secure API call.

### ⚡ Next.js → Rendering Layer

- `/blogs` listing page
- `/blogs/[slug]` dynamic article page
- Static generation with route-level caching

### 🔐 Revalidation API

A hash-secured endpoint that:

- Verifies secret
- Calls `revalidatePath()`
- Regenerates only what’s needed

## What Happens When I Publish

1. I click **Publish** in Google Sheets.
2. Apps Script:
   - Updates status
   - Generates secure hash
   - Calls Next.js revalidation API
3. Next.js regenerates:
   - `/blogs`
   - `/blogs/my-article`
4. Page updates instantly.

No rebuild.
No manual deploy.
No database.

## What I Optimized

This wasn’t just glue code.

I intentionally:

- Removed duplicate data fetches using React `cache()`
- Used route-level caching instead of fetch-level caching
- Separated listing & detail revalidation
- Secured the endpoint using hashed verification
- Avoided unnecessary existence checks
- Designed it for my scale (not imaginary scale)

It’s not overengineered.

It’s purpose-built.

## Tradeoffs

Is this scalable to 100k posts?  
No.

Is it perfect for someone writing 2–3 posts per month?  
Absolutely.

It depends on Google’s ecosystem.  
It requires structured metadata discipline.

But it removes friction.

And that was the goal.

## The Lesson

Sometimes the right architecture isn’t:

> “What’s the industry standard?”

It’s:

> “What removes friction for me?”

I didn’t need a CMS.

I needed a publishing workflow.

So I built one.

## Why This Matters

This project wasn’t about blogs.

It was about:

- Designing systems around real usage
- Avoiding unnecessary infrastructure
- Leveraging tools I already use
- Understanding caching deeply
- Automating workflows end-to-end

And honestly?

That felt better than just installing a CMS.
