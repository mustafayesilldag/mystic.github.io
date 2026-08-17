(function retryEarthPhotoOnError() {
    const img = document.getElementById("earth-photo-main");
    if (!img) return;
    let retried = false;
    img.addEventListener("error", () => {
        if (retried) return;
        retried = true;
        const baseSrc = img.getAttribute("src").split("?")[0];
        setTimeout(() => {
            img.src = `${baseSrc}?retry=${Date.now()}`;
        }, 1e3);
    });
})();

const navToggle = document.getElementById("nav-toggle");

const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".skill-card, .project-card, .contact-card, .vision-box, .about-visual-frame").forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${(e.clientX - rect.left) / rect.width * 100}%`);
            card.style.setProperty("--my", `${(e.clientY - rect.top) / rect.height * 100}%`);
        });
    });
}

const cursorGlow = document.getElementById("cursor-glow");

const prefersReducedMotionMain = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (cursorGlow && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotionMain) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    window.addEventListener("mousemove", e => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursorGlow.classList.add("is-active");
    });
    function trailLoop() {
        currentX += (targetX - currentX) * .08;
        currentY += (targetY - currentY) * .08;
        cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(trailLoop);
    }
    trailLoop();
}

const navLinks = document.querySelectorAll("[data-nav-link]");

const heroForNavEl = document.getElementById("hero");

const observedSections = [ ...navLinks ].map(link => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);

if (navLinks.length && observedSections.length && "IntersectionObserver" in window) {
    const clearNavActive = () => {
        navLinks.forEach(link => {
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
        });
    };
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            if (entry.target === heroForNavEl) {
                clearNavActive();
                return;
            }
            const activeId = entry.target.id;
            navLinks.forEach(link => {
                const isActive = link.getAttribute("href") === `#${activeId}`;
                link.classList.toggle("is-active", isActive);
                if (isActive) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
            });
        });
    }, {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
    });
    observedSections.forEach(section => sectionObserver.observe(section));
    if (heroForNavEl) sectionObserver.observe(heroForNavEl);
}

const backToTop = document.getElementById("back-to-top");

const heroSection = document.getElementById("hero");

if (backToTop && heroSection) {
    const toggleBackToTop = () => {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        backToTop.classList.toggle("is-visible", heroBottom < 0);
    };
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            toggleBackToTop();
            ticking = false;
        });
    }, {
        passive: true
    });
    toggleBackToTop();
    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotionMain ? "auto" : "smooth"
        });
    });
}

const earthPhotoLayerEl = document.getElementById("earth-photo-layer");

const brandBackBtnEl = document.getElementById("brand-btn-back");

const brandForwardBtnEl = document.getElementById("brand-btn-forward");

const EARTH_SCROLL_FADE_TRANSITION = "opacity 400ms ease-out";

function updateEarthPhotoScrollFade() {
    if (!earthPhotoLayerEl || !heroSection) return;
    if (document.body.dataset.theme !== "earth") return;
    const isTransitioning = brandBackBtnEl && brandBackBtnEl.disabled || brandForwardBtnEl && brandForwardBtnEl.disabled;
    if (isTransitioning) return;
    earthPhotoLayerEl.style.transition = EARTH_SCROLL_FADE_TRANSITION;
    const fadeDistance = heroSection.offsetHeight * 2.2;
    const fade = fadeDistance > 0 ? 1 - Math.min(window.scrollY / fadeDistance, 1) : 1;
    earthPhotoLayerEl.style.opacity = String(fade);
}

window.mysticUpdateEarthScrollFade = updateEarthPhotoScrollFade;

if (earthPhotoLayerEl && heroSection) {
    let earthFadeTicking = false;
    window.addEventListener("scroll", () => {
        if (earthFadeTicking) return;
        earthFadeTicking = true;
        requestAnimationFrame(() => {
            updateEarthPhotoScrollFade();
            earthFadeTicking = false;
        });
    }, {
        passive: true
    });
    window.addEventListener("resize", updateEarthPhotoScrollFade);
    updateEarthPhotoScrollFade();
}

(function initBrandHint() {
    const HINT_COUNT_KEY = "mysticThemeHintCount";
    const hintEl = document.getElementById("brand-hint");
    const iconGroupEl = document.querySelector(".brand-icon-group");
    if (!hintEl || !iconGroupEl) return;
    const isTouchPrimary = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const maxShows = isTouchPrimary ? 3 : 1;
    const shownCount = Number(localStorage.getItem(HINT_COUNT_KEY) || "0");
    if (shownCount >= maxShows) return;
    const prefersReducedMotionHint = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hideTimer = null;
    let shown = false;
    function dismissHint() {
        hintEl.classList.remove("is-visible");
        iconGroupEl.classList.remove("is-hinting");
        if (hideTimer) clearTimeout(hideTimer);
        localStorage.setItem(HINT_COUNT_KEY, String(shownCount + 1));
        backBtn2 && backBtn2.removeEventListener("click", dismissHint);
        forwardBtn2 && forwardBtn2.removeEventListener("click", dismissHint);
    }
    const backBtn2 = document.getElementById("brand-btn-back");
    const forwardBtn2 = document.getElementById("brand-btn-forward");
    function showHint() {
        if (shown) return;
        shown = true;
        hintEl.classList.add("is-visible");
        if (!prefersReducedMotionHint) iconGroupEl.classList.add("is-hinting");
        if (backBtn2) backBtn2.addEventListener("click", dismissHint, {
            once: true
        });
        if (forwardBtn2) forwardBtn2.addEventListener("click", dismissHint, {
            once: true
        });
        hideTimer = setTimeout(dismissHint, 5e3);
    }
    setTimeout(showHint, 1400);
})();