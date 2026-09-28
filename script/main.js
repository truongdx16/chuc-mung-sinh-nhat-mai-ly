import { createStarSky } from "./stars3d.js";
import { createNameConstellation } from "./name.js";
import { createLyricsPlayer } from "./lyricsPlayer.js";

/** Set true when lyric timings in lyrics.js are ready again. */
const LYRICS_ENABLED = false;

const reasons = window.LOVE_REASONS || [];
const UNLOCK_AT = Math.min(4, reasons.length);
const AUTO_HOLD_MS = 3400;
const FADE_MS = 900;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const intro = document.getElementById("intro");
const enterBtn = document.getElementById("enterSky");
const skyStage = document.getElementById("skyStage");
const progressCount = document.getElementById("progressCount");
const progressTotal = document.getElementById("progressTotal");
const skyHint = document.getElementById("skyHint");
const storyStage = document.getElementById("storyStage");
const storyIndex = document.getElementById("storyIndex");
const storyText = document.getElementById("storyText");
const storyNudge = document.getElementById("storyNudge");
const showConstellationBtn = document.getElementById("showConstellation");
const constellationCaption = document.getElementById("constellationCaption");
const finale = document.getElementById("finale");
const constellationSvg = document.getElementById("constellationSvg");
const canvas = document.getElementById("skyCanvas");
const song = document.querySelector(".song");
const lyricsRoot = document.getElementById("lyrics");

let storyIndexPos = -1;
let finaleStarted = false;
let transitioning = false;
let autoTimer = 0;
let nameConstellation = null;

progressTotal.textContent = String(reasons.length);

const sky = createStarSky({ canvas });
const lyricsPlayer = LYRICS_ENABLED
  ? createLyricsPlayer({ audio: song, root: lyricsRoot })
  : null;

function showCaption(title, subtitle) {
  constellationCaption.hidden = false;
  constellationCaption.classList.remove("is-leaving");
  constellationCaption.innerHTML = `${title}<span>${subtitle}</span>`;
  void constellationCaption.offsetWidth;
  constellationCaption.classList.add("is-visible");
}

function hideCaption() {
  constellationCaption.classList.add("is-leaving");
  constellationCaption.classList.remove("is-visible");
  return wait(500).then(() => {
    constellationCaption.hidden = true;
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function clearAutoTimer() {
  if (autoTimer) {
    window.clearTimeout(autoTimer);
    autoTimer = 0;
  }
}

function scheduleAutoAdvance() {
  clearAutoTimer();
  if (finaleStarted) return;
  autoTimer = window.setTimeout(() => advanceStory(), AUTO_HOLD_MS);
}

function updateUnlock() {
  const shown = storyIndexPos + 1;
  progressCount.textContent = String(Math.max(0, shown));

  if (shown >= UNLOCK_AT && !finaleStarted) {
    showConstellationBtn.hidden = false;
    skyHint.textContent = "Chòm sao đã sẵn sàng — hoặc cứ để bầu trời kể tiếp";
  }
}

function originFromStar(index) {
  if (reduceMotion) return { x: 0, y: -40, r: 0 };

  const screen = sky.getStarScreenPos(index);
  const stageRect = storyStage.getBoundingClientRect();
  const cx = stageRect.left + stageRect.width / 2;
  const cy = stageRect.top + stageRect.height / 2;

  return {
    x: screen.x - cx + (Math.random() - 0.5) * 70,
    y: screen.y - cy + (Math.random() - 0.5) * 70,
    r: (Math.random() - 0.5) * 50,
  };
}

function randomAway() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 90 + Math.random() * 220;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    r: (Math.random() - 0.5) * 70,
  };
}

function mountReasonChars(text, fromIndex) {
  storyText.innerHTML = "";
  const words = text.split(/(\s+)/);
  let charIndex = 0;

  words.forEach((token) => {
    if (/^\s+$/.test(token)) {
      const space = document.createElement("span");
      space.className = "story-space";
      space.textContent = "\u00A0";
      storyText.appendChild(space);
      return;
    }

    const word = document.createElement("span");
    word.className = "story-word";

    [...token].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "story-char";
      span.textContent = ch;

      const origin = originFromStar(fromIndex);
      span.style.setProperty("--sx", `${origin.x}px`);
      span.style.setProperty("--sy", `${origin.y}px`);
      span.style.setProperty("--sr", `${origin.r}deg`);
      span.style.setProperty(
        "--delay",
        reduceMotion ? "0ms" : `${40 + charIndex * 22}ms`
      );
      charIndex += 1;
      word.appendChild(span);
    });

    storyText.appendChild(word);
  });
}

function prepareDissolve() {
  storyText.querySelectorAll(".story-char").forEach((span, i) => {
    const away = randomAway();
    span.style.setProperty("--ex", `${away.x}px`);
    span.style.setProperty("--ey", `${away.y}px`);
    span.style.setProperty("--er", `${away.r}deg`);
    span.style.setProperty("--delay", reduceMotion ? "0ms" : `${i * 12}ms`);
  });
}

function showReason(index) {
  storyIndexPos = index;
  sky.lightStar(index);
  updateUnlock();

  storyIndex.textContent = String(index + 1).padStart(2, "0");
  mountReasonChars(reasons[index], index);
  storyNudge.textContent =
    index === reasons.length - 1 ? "Chạm để mở chòm sao" : "Chạm để xem lý do tiếp theo";

  storyStage.classList.remove("is-leaving", "is-visible");
  void storyStage.offsetWidth;
  storyStage.classList.add("is-visible");

  if (index === 0) {
    skyHint.textContent = "Mỗi câu là một ánh sáng anh dành riêng cho em";
  }

  scheduleAutoAdvance();
}

function dissolveThen(nextFn) {
  transitioning = true;
  clearAutoTimer();
  prepareDissolve();
  storyStage.classList.add("is-leaving");
  storyStage.classList.remove("is-visible");

  window.setTimeout(() => {
    transitioning = false;
    if (finaleStarted) return;
    nextFn();
  }, FADE_MS);
}

function advanceStory() {
  if (finaleStarted || transitioning) return;

  if (storyIndexPos >= reasons.length - 1) {
    dissolveThen(() => startFinale());
    return;
  }

  if (storyIndexPos < 0) {
    showReason(0);
    return;
  }

  dissolveThen(() => showReason(storyIndexPos + 1));
}

function playMusic() {
  if (!song) return;
  song.volume = 0.45;
  song.play().catch(() => {});
  if (lyricsPlayer) lyricsPlayer.start();
}

function enterSky() {
  playMusic();
  intro.classList.add("is-leaving");
  if (LYRICS_ENABLED) document.body.classList.add("has-lyrics");

  window.setTimeout(() => {
    intro.hidden = true;
    skyStage.hidden = false;
    window.setTimeout(() => advanceStory(), 900);
  }, 750);
}

async function startFinale() {
  if (finaleStarted) return;
  finaleStarted = true;
  clearAutoTimer();
  showConstellationBtn.hidden = true;
  prepareDissolve();
  storyStage.classList.remove("is-visible");
  storyStage.classList.add("is-leaving");
  progressCount.textContent = String(reasons.length);

  skyHint.textContent = "Nối thành chòm sao Thiên Bình";
  await wait(350);
  await sky.revealConstellation({ lineDuration: 1200 });
  showCaption("Thiên Bình", "Yêu một Thiên Bình là học cách chậm lại, nghe tâm hồn mình được chữa lành bởi sự dịu dàng nguyên bản");
  skyHint.textContent = "Nhẹ nhàng như cán cân — và luôn khiến anh thấy được chọn và được yêu";
  await wait(2600);

  await hideCaption();
  skyHint.textContent = "";
  await sky.fadeLibraForName();

  skyStage.hidden = true;
  document.body.classList.add("is-finale");
  finale.hidden = false;

  nameConstellation = createNameConstellation(constellationSvg);
  await nameConstellation.play({ duration: 1700 });
}

enterBtn.addEventListener("click", enterSky);

skyStage.addEventListener("click", (e) => {
  if (e.target.closest("#showConstellation")) return;
  advanceStory();
});

showConstellationBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startFinale();
});

document.addEventListener("keydown", (e) => {
  if (finaleStarted || skyStage.hidden) return;
  if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
    e.preventDefault();
    advanceStory();
  }
});
