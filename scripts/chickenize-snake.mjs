import { readFile, writeFile } from "node:fs/promises";

const files = process.argv.slice(2);

if (files.length === 0) {
  throw new Error("Usage: node scripts/chickenize-snake.mjs <svg> [svg...]");
}

for (const file of files) {
  let svg = await readFile(file, "utf8");

  if (!svg.includes("@keyframes s0") || !svg.includes("</style>")) {
    throw new Error(`Unexpected snk SVG structure: ${file}`);
  }

  const duration = svg.match(/\.s\{[^}]*animation:none linear (\d+)ms infinite/)?.[1];
  const initialTransform = svg.match(/\.s\.s0\{transform:([^;]+);animation-name:s0\}/)?.[1];

  if (!duration || !initialTransform) {
    throw new Error(`Could not locate snake head animation metadata: ${file}`);
  }

  const chickenStyle = `
.s.s0{opacity:0}
.chick-head{
  animation:none linear ${duration}ms infinite;
  transform:${initialTransform};
  animation-name:s0;
  transform-origin:0 0;
}
`;

  const chicken = `
<g class="chick-head" aria-hidden="true">
  <circle cx="7.5" cy="8" r="6.7" fill="#FFD84D" stroke="#C98A00" stroke-width="1"/>
  <circle cx="9.5" cy="6.3" r="1" fill="#24292F"/>
  <path d="M13.2 7.1 L18 9.2 L13.2 11.2 Z" fill="#F2994A"/>
  <path d="M4.4 9.2 C6.1 8.3 7.8 9.2 8.2 11.2 C6.5 12.2 4.9 11.8 4.4 9.2 Z" fill="#F2B93B"/>
  <path d="M5.4 1.8 C6.2 -0.1 7.4 -0.1 8.1 1.8 C8.8 0.4 10 0.6 10.3 2.3" fill="none" stroke="#F2994A" stroke-width="1.1" stroke-linecap="round"/>
</g>
`;

  svg = svg.replace("</style>", `${chickenStyle}</style>`);
  svg = svg.replace("</svg>", `${chicken}</svg>`);

  await writeFile(file, svg, "utf8");
  console.log(`chickenized ${file}`);
}
