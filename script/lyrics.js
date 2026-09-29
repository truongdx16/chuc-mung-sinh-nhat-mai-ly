/**
 * Timed lyrics for "Đây Là Bài Hát Sinh Nhật" — Bùi Công Nam, Cái Lò Nướng.
 * `time` = line start in seconds (audio.currentTime).
 *
 * Global nudge (seconds): positive = show later, negative = show earlier.
 */
export const TIME_OFFSET = 0;

const LYRICS_RAW = [
  // Chorus 1 — vocals ~8.3s (from audio onset)
  { time: 8.3, text: "Happy birthday to you" },
  { time: 10.9, text: "Happy birthday to you" },
  { time: 13.5, text: "Mừng tuổi mới yêu thương cao tựa đỉnh núi" },
  { time: 17.2, text: "Hạnh phúc to như biển khơi" },
  { time: 20.2, text: "Happy birthday to you" },
  { time: 22.6, text: "Happy birthday to you" },
  { time: 25.0, text: "Đặt tình yêu thương thêm hy vọng vào trong khuôn" },
  { time: 28.6, text: "Để ước mơ như hình hài mong muốn" },

  // Verse
  { time: 31.0, text: "Hôm nay là ngày nhớ lúc sinh ra" },
  { time: 33.5, text: "Ngày tiệc vui mừng với những món quà" },
  { time: 35.9, text: "Mọi người chung câu hát ngân nga" },
  { time: 38.3, text: "Cùng một chiếc bánh ngon xuýt xoa" },
  { time: 40.7, text: "Toàn là người mến, toàn là người thương" },
  { time: 43.1, text: "Người nào cũng mong điều ta sắp ước" },
  { time: 45.5, text: "Rằng tuổi mới ta sẽ làm được" },
  { time: 47.9, text: "Và mọi chờ đợi sẽ sang chương" },

  // Pre-chorus
  { time: 50.2, text: "Mong tim luôn vững tin" },
  { time: 52.5, text: "Và ta vẫn sẽ mãi hồn nhiên" },
  { time: 54.8, text: "10 năm nữa tâm hồn vẫn thế" },
  { time: 57.4, text: "Yêu đời và luôn say mê" },

  // Chorus 2
  { time: 60.0, text: "Happy birthday to you" },
  { time: 62.3, text: "Happy birthday to you" },
  { time: 64.8, text: "Mừng tuổi mới yêu thương cao tựa đỉnh núi" },
  { time: 68.6, text: "Hạnh phúc to như biển khơi" },
  { time: 71.4, text: "Happy birthday to you" },
  { time: 73.8, text: "Happy birthday to you" },
  { time: 76.2, text: "Đặt tình yêu thương thêm hy vọng vào trong khuôn" },
  { time: 79.8, text: "Để ước mơ như hình hài mong muốn" },

  // Chorus tag
  { time: 82.6, text: "Happy birthday, happy birthday to you" },
  { time: 85.6, text: "Happy birthday, happy birthday to you" },
  { time: 88.6, text: "Đặt tình yêu thương thêm hy vọng vào trong khuôn" },
  { time: 92.2, text: "Để ước mơ như hình hài mong muốn" },

  // Bridge
  { time: 95.6, text: "Thổi nến và cắt bánh" },
  { time: 98.0, text: "Để ước muốn được chắp cánh" },
  { time: 100.4, text: "Ngọt ngào sẽ đến bên mỗi ngày" },
  { time: 103.0, text: "Như chiếc bánh ngon nằm ngay ở đây" },
  { time: 105.8, text: "Thổi nến và cắt bánh" },
  { time: 108.2, text: "Để ước muốn được chắp cánh" },
  { time: 110.6, text: "Ngọt ngào sẽ đến bên mỗi ngày" },
  { time: 113.2, text: "Như chiếc bánh ngon ở đây" },

  // Final chorus
  { time: 116.4, text: "Happy birthday to you" },
  { time: 118.8, text: "Happy birthday to you" },
  { time: 121.2, text: "Mừng tuổi mới yêu thương cao tựa đỉnh núi" },
  { time: 125.0, text: "Hạnh phúc to như biển khơi" },
  { time: 127.8, text: "Happy birthday, happy birthday to you" },
  { time: 131.0, text: "Happy birthday, happy birthday to you" },
  { time: 134.0, text: "Đặt tình yêu thương thêm hy vọng vào trong khuôn" },
  { time: 137.6, text: "Để ước mơ như hình hài mong muốn" },
];

export const LYRICS = LYRICS_RAW.map((line) => ({
  ...line,
  time: Math.max(0, +(line.time + TIME_OFFSET).toFixed(2)),
}));

/**
 * @param {number} currentTime
 * @param {{ time: number, text: string }[]} lines
 * @returns {number} active line index, or -1
 */
export function findLyricIndex(currentTime, lines = LYRICS) {
  if (!lines.length || currentTime < lines[0].time) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= currentTime) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
