import { LYRICS, findLyricIndex } from "./lyrics.js";

/**
 * Karaoke-style line sync against an <audio> element.
 * @param {{ audio: HTMLAudioElement, root: HTMLElement, lines?: typeof LYRICS }} opts
 */
export function createLyricsPlayer({ audio, root, lines = LYRICS }) {
  const track = root.querySelector("[data-lyrics-track]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = -1;
  let raf = 0;
  let running = false;

  const items = lines.map((line, i) => {
    const el = document.createElement("p");
    el.className = "lyrics-line";
    el.dataset.index = String(i);
    el.textContent = line.text;
    track.appendChild(el);
    return el;
  });

  function setActive(index) {
    if (index === activeIndex) return;
    if (activeIndex >= 0) items[activeIndex]?.classList.remove("is-active");
    activeIndex = index;

    items.forEach((el, i) => {
      el.classList.toggle("is-past", i < index);
      el.classList.toggle("is-active", i === index);
      el.classList.toggle("is-upcoming", i > index);
    });

    if (index >= 0 && items[index]) {
      items[index].scrollIntoView({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
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
