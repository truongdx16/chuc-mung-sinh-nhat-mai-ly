/**
 * Libra layout traced from the reference illustration (not the scales symbol).
 * Design space: 0..1000 × 0..420 (y down).
 *
 * 0 top
 * 1–3 left arm
 * 4–5 right side of central triangle
 * 6–7 downward tail
 */
export const LIBRA_POINTS = [
  [430, 55], // 0 top
  [340, 145], // 1
  [275, 185], // 2
  [95, 230], // 3 far left
  [780, 105], // 4 upper right
  [700, 255], // 5 lower right / triangle bottom
  [430, 315], // 6 tail mid
  [430, 385], // 7 tail end
];

export const LIBRA_LINES = [
  // central triangle
  [0, 4],
  [4, 5],
  [5, 0],
  // left arm
  [0, 1],
  [1, 2],
  [2, 3],
  // tail
  [5, 6],
  [6, 7],
];
