# Lavish Cleaning Services Rebuild

High-converting, mobile-first marketing site for local home cleaning sales.

## Files

- `index.html` - Full landing page with sales copy and CTAs
- `quote.html` - Calibrated quote calculator with checkout handoff
- `checkout.html` - Custom checkout UI (Stripe-ready placeholders)
- `account.html` - Customer account portal UI (Supabase-ready placeholders)
- `admin.html` - Admin dashboard for orders, paid/completed tracking
- `styles.css` - Premium UI styling and responsive layout
- `script.js` - Frontend logic for quote, checkout, account, and admin
- `api/email.js` - Resend email API endpoint for account, purchase, and contact emails

## Launch (Fastest)

Deploy these files to Netlify, Vercel, Cloudflare Pages, or any static host.

## Important Next Steps For Real Leads

1. Configure transactional email env vars (Vercel/host):
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ADMIN_EMAIL`
2. Replace demo auth/order storage with Supabase tables + auth.
3. Add analytics + tracking:
   - Google Analytics 4
   - Meta Pixel
   - Call tracking number if needed
4. Add real service photos/testimonials for stronger trust.
5. Configure local SEO:
   - Google Business Profile links
   - City-specific landing pages later (Greenville, Greer, Anderson).
