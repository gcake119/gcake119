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
.s{display:none}
.chick-head{
  animation:none linear ${duration}ms infinite;
  transform:${initialTransform};
  animation-name:s0;
  transform-origin:0 0;
}
@keyframes chick-beak-top{
  from{transform:rotate(-13deg)}
  to{transform:rotate(3deg)}
}
@keyframes chick-beak-bottom{
  from{transform:rotate(13deg)}
  to{transform:rotate(-3deg)}
}
.chick-beak-top,.chick-beak-bottom{
  animation-duration:280ms;
  animation-iteration-count:infinite;
  animation-timing-function:ease-in-out;
  animation-direction:alternate;
  transform-origin:13.2px 9.2px;
}
.chick-beak-top{animation-name:chick-beak-top}
.chick-beak-bottom{animation-name:chick-beak-bottom}
`;

  const chicken = `
<g class="chick-head" aria-hidden="true">
  <circle cx="7.5" cy="8" r="6.7" fill="#FFD84D" stroke="#C98A00" stroke-width="1"/>
  <circle cx="9.5" cy="6.3" r="1" fill="#24292F"/>
  <path class="chick-beak-top" d="M13.2 9.2 L17.8 7.3 L17.8 9.2 Z" fill="#F2994A"/>
  <path class="chick-beak-bottom" d="M13.2 9.2 L17.8 9.2 L17.8 11.1 Z" fill="#F2994A"/>
  <path d="M4.4 9.2 C6.1 8.3 7.8 9.2 8.2 11.2 C6.5 12.2 4.9 11.8 4.4 9.2 Z" fill="#F2B93B"/>
  <path d="M5.4 1.8 C6.2 -0.1 7.4 -0.1 8.1 1.8 C8.8 0.4 10 0.6 10.3 2.3" fill="none" stroke="#F2994A" stroke-width="1.1" stroke-linecap="round"/>
</g>
`;

  svg = svg.replace("</style>", `${chickenStyle}</style>`);
  svg = svg.replace("</svg>", `${chicken}</svg>`);

  await writeFile(file, svg, "utf8");
  console.log(`chickenized ${file}`);
}
