/**
 * "MAI LY" as SVG constellation points + lines.
 * Glyphs are drawn into a tight, evenly padded viewBox so the
 * wordmark stays centered on every screen size.
 * Effect: CSS stroke-dash drawLine + starPop (same as earlier in this project).
 */

export const NAME_POINTS = [
  // M
  [30, 300],
  [30, 90],
  [110, 210],
  [190, 90],
  [190, 300],
  // A
  [260, 300],
  [315, 90],
  [370, 300],
  [287, 210],
  [343, 210],
  // I
  [450, 90],
  [450, 300],
  // L
  [560, 90],
  [560, 300],
  [650, 300],
  // Y
  [730, 90],
  [800, 200],
  [870, 90],
  [800, 300],
];

export const NAME_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
  [6, 7],
  [8, 9],
  [10, 11],
  [12, 13],
  [13, 14],
  [15, 16],
  [17, 16],
  [16, 18],
];

const VIEW_PAD_X = 36;
const VIEW_PAD_Y = 40;

function boundsOf(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Draw MAI LY into an SVG (same technique as the original drawLinesOn).
 * @param {SVGSVGElement} svg
 */
export function drawNameConstellation(svg) {
  const NS = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";
  svg.hidden = false;

  const { minX, maxX, minY, maxY } = boundsOf(NAME_POINTS);
  const vbX = minX - VIEW_PAD_X;
  const vbY = minY - VIEW_PAD_Y;
  const vbW = maxX - minX + VIEW_PAD_X * 2;
  const vbH = maxY - minY + VIEW_PAD_Y * 2;

  svg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.removeAttribute("width");
  svg.removeAttribute("height");

  NAME_LINES.forEach(([a, b], i) => {
    const [x1, y1] = NAME_POINTS[a];
    const [x2, y2] = NAME_POINTS[b];
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    line.style.animationDelay = `${0.12 + i * 0.07}s`;
    svg.appendChild(line);
  });

  const used = new Set(NAME_LINES.flat());
  [...used].forEach((idx, i) => {
    const [x, y] = NAME_POINTS[idx];
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", String(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", "4.2");
    c.setAttribute("fill", "#f3e6c8");
    c.style.opacity = "0";
    c.style.animation = "starPop 0.45s ease forwards";
    c.style.animationDelay = `${0.7 + i * 0.04}s`;
    svg.appendChild(c);
  });
}

/**
 * @param {SVGSVGElement} svg
 * @returns {{ play: (opts?: { duration?: number }) => Promise<void> }}
 */
export function createNameConstellation(svg) {
  return {
    async play({ duration = 1700 } = {}) {
      drawNameConstellation(svg);
      await new Promise((r) => window.setTimeout(r, duration));
    },
  };
}
