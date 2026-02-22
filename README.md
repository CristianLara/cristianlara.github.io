# cristianlara.me

Friendly interactive terminal with basic commands to tell you about me. 

### Commands:
* `1`
  * Type out web-formatted resume
* `2`
  * Download a pdf of my resume
* `3`
  * Display contact information
* `pokemon`
  * Spawn pokemon to randomly walk around the screen.
* `← → ↑ ↓`
  * Control the character

## Vercel Analytics

This site can use Vercel Analytics (Vercel Insights). To enable it:

- Add the Insights client script to the `<head>` of `index.html` (already added in this branch) and replace the placeholder token `__VERCEL_INSIGHTS_TOKEN__` with your Vercel token or configure it in the Vercel project settings.
- Recommended: configure the token or domain in the Vercel dashboard rather than committing sensitive tokens to source control.
- Verify by deploying and confirming network requests to `https://static.vercel-insights.com/v1/script.js` and checking the Vercel Analytics dashboard.

If you prefer centralizing analytics loading, we can instead inject the script from `js/analytics.js`.
