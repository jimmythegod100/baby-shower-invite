# Baby Boy Shower Invitation

A cute baby-blue invitation site for Andrew & Lizzie's baby shower.

**Live site:** https://jimmythegod100.github.io/baby-shower-invite/

## Event Details

- **Date:** Sunday, September 20, 2026
- **Time:** 1:00 PM
- **Location:** Andrew & Lizzie's House
- **Registry:** [Amazon Baby Registry](https://www.amazon.com/baby-reg/andrew-martinez-november-2026/11EL4A7RSIA80)

## RSVP Tracking

RSVPs use a dual path so guests are rarely stuck:

1. **Google Apps Script** — writes to a Google Sheet (when `rsvpScriptUrl` is set).
2. **FormSubmit** — emails `andrewjamesmartinez91@gmail.com` in parallel.
3. If both fail, the form shows an **email** fallback link.

### Admin dashboard (no password)

View RSVPs at: https://jimmythegod100.github.io/baby-shower-invite/admin.html

No login — the page loads the sheet list via Apps Script `?action=list`.

### Deploy / update Google Apps Script

1. Open [Google Apps Script](https://script.google.com) → open the Baby Shower RSVP project (or New project)
2. Paste contents of `scripts/google-apps-script.gs` (password checks removed)
3. Run **setupSheet** once if this is a new project (authorize when prompted)
4. **Deploy** → New deployment (or Manage deployments → Edit → New version) → Web app → "Anyone" access
5. Copy the Web App URL into `js/config.js` → `rsvpScriptUrl` if it changed
6. Push to GitHub

**Important:** GitHub Pages updates from this repo automatically, but the Apps Script backend on Google does **not**. If `admin.html` still shows an "Invalid password" error, re-paste `scripts/google-apps-script.gs` and redeploy the web app once.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main invitation |
| `admin.html` | RSVP dashboard (open — no password) |
| `js/config.js` | Site settings |
| `js/rsvp.js` | RSVP form logic (dual-path submit) |
| `css/style.css` | Baby blue styling |
| `scripts/google-apps-script.gs` | Sheet backend (redeploy after changes) |
