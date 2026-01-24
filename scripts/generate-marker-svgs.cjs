// Usage: node scripts/generate-marker-svgs.cjs
// Generates SVG marker icons for each color in the config below
const fs = require('fs');
const path = require('path');


// Import filterColors from map.config.ts
const tsConfigPath = path.join(__dirname, '../src/config/map.config.ts');
const tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8');

function extractColors(section) {
  const regex = new RegExp(section + ': ?{([\s\S]*?)}', 'm');
  const match = tsConfigContent.match(regex);
  if (!match) return {};
  const obj = {};
  const lines = match[1].split('\n').map(l => l.trim()).filter(Boolean);
  lines.forEach(line => {
    const m = line.match(/(\w+): ?['"](#\w{3,6})['"]/);
    if (m) obj[m[1]] = m[2];
  });
  return obj;
}

const filterColors = {
  priority: extractColors('priority'),
  status: extractColors('status'),
  amount: extractColors('amount'),
  complexity: extractColors('complexity'),
};

const markers = [
  // Priority
  { name: 'priority-low', color: filterColors.priority.low },
  { name: 'priority-medium', color: filterColors.priority.medium },
  { name: 'priority-high', color: filterColors.priority.high },
  // Status
  { name: 'status-pending', color: filterColors.status.pending },
  { name: 'status-inprogress', color: filterColors.status.inprogress },
  { name: 'status-completed', color: filterColors.status.completed },
  { name: 'status-cancelled', color: filterColors.status.cancelled },
  // Amount
  { name: 'amount-low', color: filterColors.amount.low },
  { name: 'amount-medium', color: filterColors.amount.medium },
  { name: 'amount-high', color: filterColors.amount.high },
  // Complexity
  { name: 'complexity-simple', color: filterColors.complexity.simple },
  { name: 'complexity-moderate', color: filterColors.complexity.moderate },
  { name: 'complexity-complex', color: filterColors.complexity.complex },
];

const svgTemplate = (color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12.5" cy="12" rx="10" ry="10" fill="${color}" stroke="#222" stroke-width="2"/>
  <path d="M12.5 40C13.5 40 22.5 25 12.5 25C2.5 25 11.5 40 12.5 40Z" fill="${color}" stroke="#222" stroke-width="2"/>
</svg>
`;

const outDir = path.join(__dirname, '../public/markers');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

markers.forEach(({ name, color }) => {
  const svg = svgTemplate(color);
  const filePath = path.join(outDir, `marker-${name}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated: ${filePath}`);
});

console.log('All marker SVGs generated.');
