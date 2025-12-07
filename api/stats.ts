import type { NextApiRequest, NextApiResponse } from 'next';

interface Language {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakatimeData {
  data: {
    username: string;
    human_readable_total: string;
    categories: Array<{ name: string; percent: number }>;
    languages: Language[];
    total_seconds: number;
  };
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3776AB',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  'C++': '#00599C',
  Rust: '#CE422B',
  Go: '#00ADD8',
  Java: '#007396',
  Kotlin: '#7F52FF',
  Swift: '#FA7343',
  'C#': '#239120',
  PHP: '#777BB4',
  Ruby: '#CC342D',
  Svelte: '#FF3E00',
  Vue: '#4FC08D',
  React: '#61DAFB',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Bash: '#4EAA25',
  SQL: '#336791',
  Markdown: '#083FA1',
  Lua: '#00007C',
  ASM: '#6E4C13',
  Json: '#F7DF1E',
  YAML: '#CB171E',
  R: '#F34FA4',
  Rmd: '#E82EE7',
  Quarto: '#7F1ABB',
  default: '#8B5CF6',
};

const getColor = (language: string): string =>
  LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default;

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const fetchStats = async (username: string): Promise<WakatimeData> => {
  const response = await fetch(
    `https://wakapi.dev/api/compat/wakatime/v1/users/${username}/stats/`,
    { headers: { Authorization: `Basic ${btoa('public:public')}` } }
  );
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

const createSvg = (data: WakatimeData['data']): string => {
  const totalLanguages = data.languages.length;
  
  const sorted = [...data.languages]
    .filter((l) => l.total_seconds >= 3600)
    .sort((a, b) => b.total_seconds - a.total_seconds);

  const codingCategory = data.categories.find((c) => c.name === 'coding');
  const codingPercent = codingCategory?.percent || 0;
  const maxPercent = Math.max(...sorted.map((l) => l.percent));

  // Calculate average per day: total / 30
  const avgDailySeconds = data.total_seconds / 30;
  const avgDisplay = formatTime(avgDailySeconds);

  const mid = Math.ceil(sorted.length / 2);
  const leftCol = sorted.slice(0, mid);
  const rightCol = sorted.slice(mid);

  const width = 900;
  const headerHeight = 150;
  const langRowHeight = 36;
  const maxRows = Math.max(leftCol.length, rightCol.length);
  const height = headerHeight + maxRows * langRowHeight + 40;

  const createColumn = (languages: Language[], startX: number): string => {
    return languages
      .map((lang, i) => {
        const y = headerHeight + 20 + i * langRowHeight;
        const barWidth = 140;
        const fillWidth = (barWidth * lang.percent) / maxPercent;
        const time = formatTime(lang.total_seconds);

        return `
          <g>
            <text x="${startX}" y="${y + 10}"
              font-family="system-ui, -apple-system, sans-serif"
              font-size="12" font-weight="600" fill="#E5E7EB">
              ${escapeXml(lang.name)}
            </text>
            <rect x="${startX}" y="${y + 14}" width="${barWidth}" height="12"
              rx="3" fill="#1E293B" stroke="#334155" stroke-width="0.5"/>
            <rect x="${startX}" y="${y + 14}" width="${fillWidth}" height="12"
              rx="3" fill="${getColor(lang.name)}" opacity="0.9"/>
            <text x="${startX + barWidth + 12}" y="${y + 20}"
              font-family="monospace" font-size="11" font-weight="600"
              fill="#10B981" text-anchor="start">
              ${time}
            </text>
          </g>
        `;
      })
      .join('');
  };

  return `
    <svg width="${width}" height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#1E293B"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%">
          <stop offset="0%" stop-color="#8B5CF6"/>
          <stop offset="100%" stop-color="#6366F1"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect width="${width}" height="${height}" rx="16" fill="none"
        stroke="#334155" stroke-width="1" opacity="0.3"/>

      <!-- Top accent line -->
      <rect x="0" y="0" width="${width}" height="4" rx="16" fill="url(#accent)"/>

      <!-- Header -->
      <text x="450" y="35"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="24" font-weight="800" fill="#F8FAFC"
        text-anchor="middle">
        @${escapeXml(data.username)}
      </text>

      <text x="450" y="60"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="13" fill="#94A3B8"
        text-anchor="middle">
        Wakatime Stats • ${codingPercent.toFixed(0)}% coding
      </text>

      <!-- Stats boxes - centered and larger -->
      <g>
        <!-- Total time -->
        <rect x="120" y="70" width="200" height="60"
          rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="220" y="92"
          font-family="system-ui" font-size="12" fill="#94A3B8"
          font-weight="600" text-anchor="middle">TOTAL</text>
        <text x="220" y="116"
          font-family="monospace" font-size="18" fill="#F1F5F9"
          font-weight="700" text-anchor="middle">${escapeXml(data.human_readable_total)}</text>

        <!-- Daily average -->
        <rect x="350" y="70" width="200" height="60"
          rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="450" y="92"
          font-family="system-ui" font-size="12" fill="#94A3B8"
          font-weight="600" text-anchor="middle">DAILY AVG</text>
        <text x="450" y="116"
          font-family="monospace" font-size="18" fill="#F1F5F9"
          font-weight="700" text-anchor="middle">${avgDisplay}</text>

        <!-- Total languages count -->
        <rect x="580" y="70" width="200" height="60"
          rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="680" y="92"
          font-family="system-ui" font-size="12" fill="#94A3B8"
          font-weight="600" text-anchor="middle">LANGUAGES</text>
        <text x="680" y="116"
          font-family="monospace" font-size="18" fill="#F1F5F9"
          font-weight="700" text-anchor="middle">${totalLanguages}</text>
      </g>

      <!-- Left column -->
      ${createColumn(leftCol, 80)}

      <!-- Divider -->
      <line x1="470" y1="${headerHeight + 10}"
        x2="470" y2="${headerHeight + maxRows * langRowHeight + 10}"
        stroke="#334155" stroke-width="1" opacity="0.3"/>

      <!-- Right column -->
      ${createColumn(rightCol, 550)}
    </svg>
  `;
};

const createErrorSvg = (message: string): string => `
  <svg width="900" height="100"
    viewBox="0 0 900 100"
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
    </defs>
    <rect width="900" height="100" fill="url(#bg)"/>
    <rect width="900" height="100" rx="16" fill="none"
      stroke="#334155" stroke-width="1" opacity="0.3"/>
    <text x="450" y="55"
      font-family="system-ui, sans-serif" font-size="14" fill="#F87171"
      text-anchor="middle" font-weight="600">
      ${escapeXml(message)}
    </text>
  </svg>
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
): Promise<void> {
  const { username } = req.query;

  if (!username || typeof username !== 'string' || !username.trim()) {
    res.status(400).send(createErrorSvg('?username=yourname'));
    return;
  }

  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(username)) {
    res.status(400).send(createErrorSvg('Invalid username'));
    return;
  }

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600'
  );

  try {
    const data = await fetchStats(username);
    res.send(createSvg(data.data));
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch stats';
    res.send(createErrorSvg(msg));
  }
}


