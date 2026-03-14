# LightLag Repo Setup Guide

Migration steps to move the marschat concept page into its own private repo with custom domain, form handling, and pre-launch stealth config.

---

## 1. Create Private GitHub Repo

```bash
gh repo create lightlag --private --description "LightLag — delay-native communication protocol"
cd lightlag
git init
git remote add origin git@github.com:ljcairns/lightlag.git
```

> Repo name is a placeholder. Rename later with `gh repo rename <new-name>`.

---

## 2. Copy marschat/ Contents as Repo Root

From the briu-website directory:

```bash
cp marschat/index.html lightlag/
cp marschat/lightlag-concept.html lightlag/
```

Flatten — these files become the repo root, not a subdirectory.

---

## 3. GitHub Pages Deployment

Settings > Pages > Source: **Deploy from a branch** > Branch: `main`, folder: `/ (root)`.

Or via CLI:

```bash
gh api repos/ljcairns/lightlag/pages -X POST -f source.branch=main -f source.path=/
```

Confirm at: `https://ljcairns.github.io/lightlag/`

---

## 4. Register Domain on Porkbun

1. Go to [porkbun.com](https://porkbun.com) and search for desired domain.
2. Purchase and confirm ownership via email verification.
3. Disable Porkbun's default DNS parking records (A/AAAA/CNAME) — Cloudflare will handle DNS.
4. Update nameservers to Cloudflare's (assigned when you add the site in step 5).

Same pattern used for `briu.ai` ($85 via Porkbun for .ai TLD).

---

## 5. Cloudflare DNS Config

### Add Site to Cloudflare

1. Cloudflare dashboard > **Add a site** > enter the domain.
2. Select Free plan.
3. Copy the two Cloudflare nameservers and set them in Porkbun (step 4).

### SSL Settings

**SSL/TLS > Overview** > set encryption mode to **Full**.

### DNS Records

| Type  | Name | Content                  | Proxy   |
|-------|------|--------------------------|---------|
| CNAME | @    | ljcairns.github.io       | Proxied |
| CNAME | www  | ljcairns.github.io       | Proxied |

> Proxied (orange cloud) = Cloudflare handles SSL termination and caching.

### CNAME File in Repo

Add a `CNAME` file to the repo root containing just the bare domain:

```
yourdomain.tld
```

```bash
echo "yourdomain.tld" > CNAME
git add CNAME && git commit -m "add CNAME for custom domain"
git push
```

GitHub will automatically configure the custom domain in Pages settings when it sees this file.

### Reference: Cloudflare DNS Screenshot Pattern

Same setup used for briu.ai — two CNAME records (root + www) pointing to `ljcairns.github.io`, both proxied, SSL Full. The Cloudflare DNS panel should show:

```
CNAME  @    ljcairns.github.io  Proxied
CNAME  www  ljcairns.github.io  Proxied
```

If you saved a screenshot from the briu.ai setup, the new site's DNS page should look identical except for the domain name.

---

## 6. Form / Newsletter Setup

### Option A: Formspree (simple contact form)

1. Create a form at [formspree.io/forms](https://formspree.io/forms).
2. Copy the form endpoint (e.g., `https://formspree.io/f/xyzabc`).
3. Update the `<form>` action URL in `index.html`:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Free tier: 50 submissions/month. No backend needed.

### Option B: Buttondown (newsletter with API)

1. Create account at [buttondown.com](https://buttondown.com).
2. Get API key from Settings > API.
3. Add a subscribe form or use the Buttondown embed:

```html
<form action="https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME" method="post">
  <input type="email" name="email" placeholder="your@email.com" required>
  <button type="submit">Subscribe</button>
</form>
```

Better for ongoing updates. Free up to 100 subscribers.

---

## 7. Pre-Launch Stealth Config

### robots.txt

Add to repo root:

```
User-agent: *
Disallow: /
```

### noindex Meta Tag

Add to `<head>` of every HTML page:

```html
<meta name="robots" content="noindex, nofollow">
```

Remove both when ready to launch.

---

## 8. Repo Scaffolding

### .gitignore

```
.DS_Store
*.swp
*.swo
node_modules/
.env
```

### LICENSE

Use **MIT** for the concept page (public-facing HTML/CSS):

```
MIT License — Copyright (c) 2026 LightLag
```

For protocol spec content, add a separate notice in the relevant files or a `LICENSE-PROTOCOL` file:

```
Proprietary — All rights reserved. Protocol specification may not be reproduced
or distributed without written permission.
```

### README.md

```markdown
# LightLag

Delay-native communication protocol concept.

Private repo. Public site at [yourdomain.tld](https://yourdomain.tld).
```

---

## 9. Commit and Push

```bash
git add -A
git commit -m "initial setup: concept page, domain config, pre-launch stealth"
git push -u origin main
```

---

## Checklist

- [ ] Private repo created on GitHub
- [ ] Files copied and committed
- [ ] GitHub Pages enabled (main branch, root)
- [ ] Domain registered on Porkbun
- [ ] Nameservers pointed to Cloudflare
- [ ] Cloudflare site added, SSL set to Full
- [ ] CNAME records added (root + www), proxied
- [ ] CNAME file in repo root
- [ ] Formspree or Buttondown configured
- [ ] Form action URL updated in index.html
- [ ] robots.txt disallowing all
- [ ] noindex meta tag on all pages
- [ ] .gitignore, LICENSE, README.md added
- [ ] Site loads over HTTPS on custom domain
