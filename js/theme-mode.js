const THEME_ORDER = [ "earth", "galaxy", "universe" ];

const THEME_COLORS = {
    earth: "#02060f",
    galaxy: "#06050e",
    universe: "#08060a"
};

const TRANSITION_TIMING = {
    warpIn: { duration: 2800, swap: .62 },
    warpOut: { duration: 2800, swap: .16 },
    dollyIn: { duration: 2400, swap: .46 },
    dollyOut: { duration: 2900, swap: .5 }
};

const themeRoot = document.documentElement;

const backBtn = document.getElementById("brand-btn-back");

const forwardBtn = document.getElementById("brand-btn-forward");

const flashLayer = document.getElementById("warp-overlay");

const earthPhotoLayerForTheme = document.getElementById("earth-photo-layer");

const themeColorMeta = document.getElementById("meta-theme-color");

const prefersReducedMotionTheme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentTheme = document.body.dataset.theme || "earth";

let isWarping = false;

let transitionTimers = [];

let pendingTheme = null;

function themeIndex(theme) {
    return THEME_ORDER.indexOf(theme);
}

function themeLabel(targetTheme) {
    const lang = (document.documentElement.lang || "tr").toLowerCase();
    const dict = typeof MYSTIC_I18N !== "undefined" && MYSTIC_I18N[lang] || null;
    const keys = {
        earth: "brandToggle.toEarth",
        galaxy: "brandToggle.toGalaxy",
        universe: "brandToggle.toUniverse"
    };
    const key = keys[targetTheme];
    if (dict && dict[key]) return dict[key];
    const fallback = {
        earth: "Dünya moduna dön",
        galaxy: "Galaksi moduna geç",
        universe: "Evren moduna geç"
    };
    return fallback[targetTheme];
}

function applyButtonLabels(theme) {
    const idx = themeIndex(theme);
    if (backBtn && idx > 0) {
        backBtn.setAttribute("aria-label", themeLabel(THEME_ORDER[idx - 1]));
    }
    if (forwardBtn && idx < THEME_ORDER.length - 1) {
        forwardBtn.setAttribute("aria-label", themeLabel(THEME_ORDER[idx + 1]));
    }
}

window.mysticRefreshBrandLabel = function() {
    applyButtonLabels(document.body.dataset.theme || "earth");
};

function swapThemeDom(theme) {
    currentTheme = theme;
    document.body.dataset.theme = theme;
    themeRoot.dataset.theme = theme;
    if (themeColorMeta) themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
    applyButtonLabels(theme);
}

function later(fn, ms) {
    transitionTimers.push(setTimeout(fn, ms));
}

function clearTransitionTimers() {
    transitionTimers.forEach(clearTimeout);
    transitionTimers = [];
}

function playFlash(kind) {
    if (!flashLayer) return;
    flashLayer.classList.remove("is-flash", "is-bang", "is-fade");
    void flashLayer.offsetWidth;
    flashLayer.classList.add(kind);
}

if (flashLayer) {
    flashLayer.addEventListener("animationend", () => {
        flashLayer.classList.remove("is-flash", "is-bang", "is-fade");
    });
}

function heroArrive() {
    const hero = document.querySelector(".hero-content");
    if (!hero) return;
    hero.classList.remove("is-arriving");
    void hero.offsetWidth;
    hero.classList.add("is-arriving");
    hero.addEventListener("animationend", function handler(e) {
        if (e.target !== hero) return;
        hero.classList.remove("is-arriving");
        hero.removeEventListener("animationend", handler);
    });
}

function revealContent() {
    if (!themeRoot.classList.contains("is-theme-shifting")) return;
    themeRoot.classList.remove("is-theme-shifting");
    heroArrive();
}

function finishTransition(chargingBtn) {
    clearTransitionTimers();
    if (pendingTheme && currentTheme !== pendingTheme) swapThemeDom(pendingTheme);
    if (typeof window.mysticFinishDolly === "function") window.mysticFinishDolly();
    pendingTheme = null;
    revealContent();
    if (chargingBtn) chargingBtn.classList.remove("is-charging");
    if (backBtn) backBtn.disabled = false;
    if (forwardBtn) forwardBtn.disabled = false;
    delete themeRoot.dataset.shift;
    isWarping = false;
    if (typeof window.mysticUpdateEarthScrollFade === "function") {
        window.mysticUpdateEarthScrollFade();
    }
}

function startTransition(targetTheme, direction) {
    if (isWarping) return;
    isWarping = true;
    if (backBtn) backBtn.disabled = true;
    if (forwardBtn) forwardBtn.disabled = true;
    if (earthPhotoLayerForTheme) earthPhotoLayerForTheme.style.transition = "none";
    const fromTheme = currentTheme;
    pendingTheme = targetTheme;
    const chargingBtn = direction === "out" ? forwardBtn : backBtn;
    const useWarp = fromTheme === "earth" || targetTheme === "earth";
    const timing = TRANSITION_TIMING[(useWarp ? "warp" : "dolly") + (direction === "in" ? "In" : "Out")];
    themeRoot.dataset.shift = `${fromTheme}-${targetTheme}`;
    const quick = prefersReducedMotionTheme || themeRoot.classList.contains("no-webgl");
    if (quick) {
        playFlash("is-fade");
        later(() => {
            swapThemeDom(targetTheme);
            if (typeof window.mysticSetScene === "function") window.mysticSetScene(targetTheme);
        }, 200);
        later(() => finishTransition(null), 460);
        return;
    }
    themeRoot.classList.add("is-theme-shifting");
    if (chargingBtn) chargingBtn.classList.add("is-charging");
    const afterSwap = timing.duration * (1 - timing.swap);
    window.mysticOnDollySwap = theme => {
        swapThemeDom(theme);
        playFlash(theme === "universe" ? "is-bang" : "is-flash");
        later(revealContent, Math.max(320, afterSwap * .42));
    };
    if (typeof window.mysticStartCameraDolly === "function") {
        window.mysticStartCameraDolly(direction, targetTheme, timing.duration, timing.swap, useWarp);
    } else {
        later(() => window.mysticOnDollySwap(targetTheme), timing.duration * timing.swap);
    }
    later(() => finishTransition(chargingBtn), timing.duration + 40);
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        const idx = themeIndex(currentTheme);
        if (idx <= 0) return;
        startTransition(THEME_ORDER[idx - 1], "in");
    });
}

if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
        const idx = themeIndex(currentTheme);
        if (idx >= THEME_ORDER.length - 1) return;
        startTransition(THEME_ORDER[idx + 1], "out");
    });
}

swapThemeDom(currentTheme);

window.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !isWarping) return;
    if (typeof window.mysticSkipTransition === "function") {
        window.mysticSkipTransition();
    }
    const chargingBtn = document.querySelector(".brand-icon-btn.is-charging");
    clearTransitionTimers();
    later(() => finishTransition(chargingBtn), 80);
});
