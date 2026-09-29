import { LYRICS, findLyricIndex } from "./lyrics.js";

/**
 * Single-line lyric sync against an <audio> element.
 * @param {{ audio: HTMLAudioElement, root: HTMLElement, lines?: typeof LYRICS }} opts
 */
export function createLyricsPlayer({ audio, root, lines = LYRICS }) {
  const lineEl = root.querySelector("[data-lyrics-line]");
  let activeIndex = -1;
  let raf = 0;
  let running = false;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    if (index < 0 || !lines[index]) {
      lineEl.textContent = "";
      lineEl.classList.remove("is-active");
      return;
    }

    lineEl.textContent = lines[index].text;
    lineEl.classList.add("is-active");
  }

  function tick() {
    if (!running) return;
    const t = audio.currentTime || 0;
    setActive(findLyricIndex(t, lines));
    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    root.hidden = false;
    root.classList.add("is-visible");
    tick();
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function hide() {
    stop();
    root.classList.remove("is-visible");
    root.hidden = true;
  }

  audio.addEventListener("seeked", () => {
    setActive(findLyricIndex(audio.currentTime || 0, lines));
  });

  audio.addEventListener("ended", () => {
    setActive(lines.length - 1);
  });

  return { start, stop, hide, setActive };
}
