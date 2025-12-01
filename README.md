# Wakapi Stats Badge

A beautiful, responsive SVG badge generator that displays your Wakapi coding statistics. Perfect for GitHub profiles, personal websites, or developer portfolios.

## Features

- Real-time stats - Fetches live data from your Wakapi account
- Beautiful design - Dark theme with gradient backgrounds and color-coded languages
- Optimized caching - Server and CDN caching for fast loads
- Secure - Input validation and XML escaping to prevent injection attacks
- Responsive - Scales beautifully on any device
- Zero dependencies - Uses only Next.js native APIs
- Color-coded languages - 20+ languages with brand-accurate colors

## Quick Start

### 1. Deploy

Deploy this API route to Vercel or your Next.js host:

```bash
git clone https://github.com/monster0506/wakatime-stats
cd wakatime-stats
npm install
npm run dev
```

### 2. Get Your Badge

Add an image to your README:

```markdown
![Wakapi Stats](https://wakatime-stats-three.vercel.app/api/stats?username=yourwakatimeusername)
```

Replace `wakapiusername` with your Wakapi username.

## Usage Examples

### GitHub README

```markdown
## My Coding Activity

![Wakapi Stats](https://wakatime-stats-three.vercel.app/api/stats?username=monster0506)
```

### HTML

```html
<img src="https://wakatime-stats-three.vercel.app/api/stats?username=monster0506" 
     alt="Wakapi Stats" />
```

### Dynamic (with multiple profiles)

```markdown
![User One Stats](https://wakatime-stats-three.vercel.app/api/stats?username=user_one)
![User Two Stats](https://wakatime-stats-three.vercel.app/api/stats?username=user_two)
```

## API Reference

### Endpoint

```
GET /api/stats?username=<wakapiusername>
```

### Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| username  | string | Yes      | Your Wakapi username   |

### Response

- 200 - SVG badge (image/svg+xml)
- 400 - Invalid or missing username (error SVG)

### Examples

Valid:
```
/api/stats?username=john_doe
/api/stats?username=john-doe
/api/stats?username=john_doe_123
```

Invalid:
```
/api/stats?username=john@doe
/api/stats?username=
/api/stats?username=john$doe
```

## What's Displayed

The badge shows:

- Total Time - All-time coding hours
- Daily Average - Average per day
- Language Count - Total unique languages tracked
- Top Languages - Up to 20 languages with time spent (bars show relative percentages)

Languages under 1 hour are filtered out for clarity.

## Customization

### Change Language Colors

Edit `LANGUAGE_COLORS` in the API route:

```typescript
const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3776AB',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  // Add or modify colors here
  YourLanguage: '#HexColor',
};
```

### Adjust Layout

Modify SVG dimensions in `createSvg()`:

```typescript
const width = 900;              // Badge width
const langRowHeight = 36;       // Space per language
const headerHeight = 150;       // Top section height
```

### Change Caching

Adjust cache headers:

```typescript
res.setHeader(
  'Cache-Control',
  'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600'
);
```

- `s-maxage=1800` - CDN cache (30 minutes)
- `stale-while-revalidate=3600` - Serve stale for 1 hour while refreshing

## Security

This implementation includes:

- Username validation (alphanumeric, hyphens, underscores only)
- XML entity escaping to prevent injection
- Length limits on input
- Readonly public API authentication

## Prerequisites

- Node.js 16 or higher
- Next.js 12 or higher
- Wakapi account (free or paid)

## Troubleshooting

**"Invalid username" error**
- Check your Wakapi username matches your profile URL
- Use only alphanumeric characters, hyphens, and underscores
- Maximum 100 characters

**No data showing**
- Ensure you've logged coding time on Wakapi
- Wait a few minutes for data to sync
- Check your profile is public: [wakapi.dev/settings](https://wakapi.dev/settings) -> Permissions -> Public Data

**Badge not updating**
- Cached for 30 minutes
- Clear cache by redeploying or wait for expiration
- Add `?t=` + timestamp for cache-busting

