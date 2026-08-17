const THEME_ORDER = [ "earth", "galaxy", "universe" ];

const backBtn = document.getElementById("brand-btn-back");

const forwardBtn = document.getElementById("brand-btn-forward");

const warpOverlay = document.getElementById("warp-overlay");

const earthPhotoLayerForTheme = document.getElementById("earth-photo-layer");

const prefersReducedMotionTheme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DOLLY_DURATION = 1600;

const DOLLY_SWAP_FRACTION = .46;

const WARP_DURATION = 2800;

const WARP_SWAP_FRACTION_IN = .62;

const WARP_SWAP_FRACTION_OUT = .16;

const REDUCED_DURATION = 260;

const REDUCED_SWAP_DELAY = 130;

let currentTheme = document.body.dataset.theme || "earth";

let isWarping = false;

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
    applyButtonLabels(theme);
}

function hideHeroForWarp() {
    const hero = document.querySelector(".hero-content");
    if (!hero) return;
    hero.classList.remove("is-arriving");
    hero.classList.add("is-hidden-for-warp");
}

function triggerHeroArrive() {
    const hero = document.querySelector(".hero-content");
    if (!hero) return;
    hero.classList.remove("is-hidden-for-warp");
    hero.classList.remove("is-arriving");
    void hero.offsetWidth;
    hero.classList.add("is-arriving");
    hero.addEventListener("animationend", function handler() {
        hero.classList.remove("is-arriving");
        hero.removeEventListener("animationend", handler);
    });
}

function finishWarp(chargingBtn, overlayClass) {
    warpOverlay.classList.remove(overlayClass);
    if (chargingBtn) chargingBtn.classList.remove("is-charging");
    if (backBtn) backBtn.disabled = false;
    if (forwardBtn) forwardBtn.disabled = false;
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
    const chargingBtn = direction === "out" ? forwardBtn : backBtn;
    const useWarp = currentTheme === "earth" || targetTheme === "earth";
    const duration = useWarp ? WARP_DURATION : DOLLY_DURATION;
    const swapFraction = useWarp ? direction === "in" ? WARP_SWAP_FRACTION_IN : WARP_SWAP_FRACTION_OUT : DOLLY_SWAP_FRACTION;
    if (useWarp) hideHeroForWarp();
    if (prefersReducedMotionTheme) {
        warpOverlay.classList.add("is-warping-reduced");
        setTimeout(() => {
            swapThemeDom(targetTheme);
            if (typeof window.mysticSetScene === "function") window.mysticSetScene(targetTheme);
        }, REDUCED_SWAP_DELAY);
        setTimeout(() => {
            finishWarp(null, "is-warping-reduced");
            if (useWarp) triggerHeroArrive();
        }, REDUCED_DURATION);
        return;
    }
    if (chargingBtn) chargingBtn.classList.add("is-charging");
    window.mysticOnDollySwap = theme => {
        swapThemeDom(theme);
        warpOverlay.classList.add("is-warping-full");
    };
    if (typeof window.mysticStartCameraDolly === "function") {
        window.mysticStartCameraDolly(direction, targetTheme, duration, swapFraction, useWarp);
    } else {
        swapThemeDom(targetTheme);
    }
    setTimeout(() => {
        finishWarp(chargingBtn, "is-warping-full");
        if (useWarp) triggerHeroArrive();
    }, duration);
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

applyButtonLabels(currentTheme);

window.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !isWarping) return;
    if (typeof window.mysticSkipTransition === "function") {
        window.mysticSkipTransition();
    }
});