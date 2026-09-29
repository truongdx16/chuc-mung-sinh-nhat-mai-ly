/**
 * Coming-soon gate.
 * Opens publicly at 00:00 on 03/10/2026 (Asia/Ho_Chi_Minh).
 * Before that, unlock with PASSWORD (stored in sessionStorage for the tab).
 */
export const OPEN_AT = new Date("2026-10-03T00:00:00+07:00");

/** Change this before deploy if you want a different early-access code. */
export const GATE_PASSWORD = "maily0310";

const STORAGE_KEY = "maily-sky-gate-unlocked";

export function isPubliclyOpen(now = new Date()) {
  return now.getTime() >= OPEN_AT.getTime();
}

export function hasEarlyAccess() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantEarlyAccess() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode — still allow this session in memory */
  }
}

export function checkPassword(input) {
  return String(input || "")
    .trim()
    .toLowerCase() === GATE_PASSWORD.toLowerCase();
}

export function shouldShowGate() {
  return !isPubliclyOpen() && !hasEarlyAccess();
}

/**
 * Mount countdown + password UI. Resolves when the site may open.
 * @param {HTMLElement} root
 * @returns {Promise<void>}
 */
export function mountGate(root) {
  if (!shouldShowGate()) {
    root.hidden = true;
    document.documentElement.classList.remove("is-gated");
    document.body.classList.remove("is-gated");
    return Promise.resolve();
  }

  document.documentElement.classList.add("is-gated");
  document.body.classList.add("is-gated");
  root.hidden = false;

  const countdownEl = root.querySelector("[data-gate-countdown]");
  const form = root.querySelector("[data-gate-form]");
  const input = root.querySelector("[data-gate-input]");
  const errorEl = root.querySelector("[data-gate-error]");
  const toggleBtn = root.querySelector("[data-gate-toggle]");
  const unlockPanel = root.querySelector("[data-gate-unlock]");

  function formatCountdown(ms) {
    if (ms <= 0) return "Đã đến giờ…";
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (days > 0) {
      return `${days} ngày ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  function tickCountdown() {
    const left = OPEN_AT.getTime() - Date.now();
    if (countdownEl) countdownEl.textContent = formatCountdown(left);
    if (left <= 0) {
      unlockSite();
      return false;
    }
    return true;
  }

  let timer = 0;
  function startCountdown() {
    if (!tickCountdown()) return;
    timer = window.setInterval(() => {
      if (!tickCountdown()) window.clearInterval(timer);
    }, 1000);
  }

  function unlockSite() {
    window.clearInterval(timer);
    root.classList.add("is-leaving");
    window.setTimeout(() => {
      root.hidden = true;
      document.documentElement.classList.remove("is-gated");
      document.body.classList.remove("is-gated");
      resolveOpen();
    }, 600);
  }

  let resolveOpen;
  const ready = new Promise((resolve) => {
    resolveOpen = resolve;
  });

  toggleBtn?.addEventListener("click", () => {
    const open = unlockPanel?.hidden;
    if (unlockPanel) unlockPanel.hidden = !open;
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) input?.focus();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPassword(input?.value)) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = "Mật mã chưa đúng — thử lại nhé";
      }
      form.classList.remove("is-shake");
      void form.offsetWidth;
      form.classList.add("is-shake");
      input?.select();
      return;
    }
    if (errorEl) errorEl.hidden = true;
    grantEarlyAccess();
    unlockSite();
  });

  startCountdown();
  return ready;
}
