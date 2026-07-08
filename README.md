# Baby Boy Shower Invitation

A cute baby-blue invitation site for Andrew & Lizzie's baby shower.

**Live site:** https://jimmythegod100.github.io/baby-shower-invite/

## Event Details

- **Date:** Saturday, September 20, 2026
- **Time:** 1:00 PM
- **Location:** Andrew & Lizzie's House
- **Registry:** [Amazon Baby Registry](https://www.amazon.com/baby-reg/andrew-martinez-november-2026/11EL4A7RSIA80)

## RSVP Tracking

RSVPs work two ways:

1. **FormSubmit (active now)** — Each RSVP emails `andrewjamesmartinez91@gmail.com` with name, attending status, and guest count.
2. **Google Apps Script + Admin Dashboard (recommended)** — Deploy `scripts/google-apps-script.gs` for a live spreadsheet and admin page.

### Enable the admin dashboard

1. Open [Google Apps Script](https://script.google.com) → New project
2. Paste contents of `scripts/google-apps-script.gs`
3. Run **setupSheet** once (authorize when prompted)
4. **Deploy** → New deployment → Web app → "Anyone" access
5. Copy the Web App URL into `js/config.js` → `rsvpScriptUrl`
6. Push to GitHub

View RSVPs at: `https://jimmythegod100.github.io/baby-shower-invite/admin.html`  
Default password: `babyblue2026` (change in both `js/config.js` and the Apps Script)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main invitation |
| `admin.html` | RSVP dashboard (password protected) |
| `js/config.js` | Site settings |
| `js/rsvp.js` | RSVP form logic |
| `css/style.css` | Baby blue styling |
