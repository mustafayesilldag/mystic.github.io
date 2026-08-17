const container = document.getElementById("bg-canvas-container");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobile = window.innerWidth < 768;

const scene = new THREE.Scene;

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, .1, 200);

const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));

container.appendChild(renderer.domElement);

scene.fog = new THREE.FogExp2(328970, .05);

let normalCameraZ = 7.5;

const BASE_FOV = 55;

let dollyState = null;

function updateCameraForViewport() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    if (aspect < .6) normalCameraZ = 13; else if (aspect < 1) normalCameraZ = 10.5; else if (aspect < 1.4) normalCameraZ = 9; else normalCameraZ = 7.5;
    if (!dollyState) camera.position.z = normalCameraZ;
    camera.updateProjectionMatrix();
}

updateCameraForViewport();

function createParticleTex() {
    const sz = 64;
    const c = document.createElement("canvas");
    c.width = c.height = sz;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(.18, "rgba(255,255,255,0.85)");
    g.addColorStop(.45, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
}

function createNebulaTex() {
    const sz = 128;
    const c = document.createElement("canvas");
    c.width = c.height = sz;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(.35, "rgba(255,255,255,0.45)");
    g.addColorStop(.7, "rgba(255,255,255,0.08)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
}

const particleTex = createParticleTex();

const nebulaTex = createNebulaTex();

const colorWhiteCore = new THREE.Color(16775423);

const colorLavender = new THREE.Color(13937407);

const colorAmethyst = new THREE.Color(11032055);

const colorDeepViolet = new THREE.Color(4988309);

const colorCyan = new THREE.Color(8246268);

const colorRose = new THREE.Color(16622767);

function buildStarField() {
    const count = isMobile ? 900 : 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = 18 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        pos[i3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = r * Math.cos(phi);
        const t = Math.random();
        let c;
        if (t < .6) c = colorCyan.clone().lerp(colorWhiteCore, Math.random() * .7); else if (t < .85) c = colorWhiteCore.clone(); else c = colorRose.clone().lerp(colorLavender, Math.random());
        col[i3] = c.r;
        col[i3 + 1] = c.g;
        col[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        size: .06,
        map: particleTex,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: .55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
}

function buildNebulaClouds() {
    const group = new THREE.Group;
    const clouds = [ [ 1.2, .3, .5, 4.2, 12616956, .18 ], [ -1.5, .1, -.8, 4.8, 8141549, .22 ], [ 3, -.2, 1, 3.5, 10980346, .15 ], [ -2.8, .4, .3, 4, 7153881, .2 ], [ .5, -.3, -2.2, 3.2, 16622767, .14 ], [ -.8, .6, 2.5, 2.8, 9647082, .16 ], [ 2.5, .5, -1.5, 2.4, 16361673, .12 ], [ -2, -.5, 1.8, 2.6, 4988309, .17 ] ];
    clouds.forEach(([x, y, z, size, hex, op]) => {
        const mat = new THREE.SpriteMaterial({
            map: nebulaTex,
            color: new THREE.Color(hex),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: op
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(size, size, 1);
        sprite.position.set(x, y, z);
        group.add(sprite);
    });
    return group;
}

const GALAXY_COUNT = isMobile ? 7e3 : 18e3;

const GALAXY_RADIUS = 5.5;

const GALAXY_BRANCHES = 4;

const GALAXY_SPIN = 1.15;

const GALAXY_RAND_POW = 3.2;

function pickBranchIndex() {
    const r = Math.random();
    if (r < .38) return 0;
    if (r < .76) return 2;
    if (r < .88) return 1;
    return 3;
}

function buildGalaxy() {
    const positions = new Float32Array(GALAXY_COUNT * 3);
    const colors = new Float32Array(GALAXY_COUNT * 3);
    for (let i = 0; i < GALAXY_COUNT; i++) {
        const i3 = i * 3;
        const radius = Math.pow(Math.random(), .55) * GALAXY_RADIUS;
        const branchAngle = pickBranchIndex() / GALAXY_BRANCHES * Math.PI * 2;
        const spinAngle = radius * GALAXY_SPIN;
        const thickness = Math.max(.04, (1 - radius / GALAXY_RADIUS) * .5);
        const randScale = Math.pow(Math.random(), GALAXY_RAND_POW) * .45 * radius;
        const rx = randScale * (Math.random() < .5 ? 1 : -1);
        const ry = (Math.random() - .5) * thickness * (isMobile ? 1.4 : 1.8);
        const rz = randScale * (Math.random() < .5 ? 1 : -1);
        const angle = branchAngle + spinAngle;
        positions[i3] = Math.cos(angle) * radius + rx;
        positions[i3 + 1] = ry;
        positions[i3 + 2] = Math.sin(angle) * radius + rz;
        const t = radius / GALAXY_RADIUS;
        let mixed;
        if (t < .15) {
            mixed = colorWhiteCore.clone().lerp(colorLavender, t / .15);
        } else if (t < .45) {
            mixed = colorLavender.clone().lerp(colorAmethyst, (t - .15) / .3);
        } else {
            mixed = colorAmethyst.clone().lerp(colorDeepViolet, (t - .45) / .55);
        }
        const nearArmCenter = randScale < radius * .05;
        const dustSide = rx < 0;
        if (nearArmCenter && dustSide && t > .18) {
            mixed = mixed.clone().multiplyScalar(.4);
        }
        colors[i3] = mixed.r;
        colors[i3 + 1] = mixed.g;
        colors[i3 + 2] = mixed.b;
    }
    const geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        size: isMobile ? .065 : .055,
        map: particleTex,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: .88,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
}

function buildBrightStars() {
    const count = isMobile ? 160 : 360;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = Math.pow(Math.random(), .5) * GALAXY_RADIUS;
        const branchAngle = pickBranchIndex() / GALAXY_BRANCHES * Math.PI * 2;
        const spinAngle = radius * GALAXY_SPIN;
        const randScale = Math.pow(Math.random(), GALAXY_RAND_POW) * .3 * radius;
        const rx = randScale * (Math.random() < .5 ? 1 : -1);
        const rz = randScale * (Math.random() < .5 ? 1 : -1);
        const angle = branchAngle + spinAngle;
        positions[i3] = Math.cos(angle) * radius + rx;
        positions[i3 + 1] = (Math.random() - .5) * .18;
        positions[i3 + 2] = Math.sin(angle) * radius + rz;
        const t = radius / GALAXY_RADIUS;
        const c = t < .3 ? colorWhiteCore.clone().lerp(colorLavender, t / .3) : colorLavender.clone().lerp(colorAmethyst, Math.min((t - .3) / .5, 1));
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        size: isMobile ? .13 : .11,
        map: particleTex,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: .9,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
}

function buildCoreBulge() {
    const count = isMobile ? 500 : 1100;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.8) * 1.1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta) * 1.6;
        positions[i3 + 1] = r * Math.cos(phi) * .55;
        positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) * .75;
        const t = r / 1.1;
        const c = colorWhiteCore.clone().lerp(colorLavender, Math.min(t, 1));
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        size: isMobile ? .07 : .06,
        map: particleTex,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: .85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
}

const BIGBANG_PARTICLE_COUNT = isMobile ? 900 : 2200;

const BIGBANG_MAX_RADIUS = 3.35;

function createGlowTexWarm(inner, outer) {
    const sz = 256;
    const c = document.createElement("canvas");
    c.width = c.height = sz;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, inner);
    g.addColorStop(.3, "rgba(255,130,101,0.55)");
    g.addColorStop(.65, "rgba(140,40,35,0.14)");
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
}

function buildObservableUniverse() {
    const group = new THREE.Group;
    const colorHot = new THREE.Color(15258312);
    const colorMid = new THREE.Color(13193008);
    const colorCool = new THREE.Color(3149836);
    const particlePos = new Float32Array(BIGBANG_PARTICLE_COUNT * 3);
    const particleCol = new Float32Array(BIGBANG_PARTICLE_COUNT * 3);
    const streakPos = new Float32Array(BIGBANG_PARTICLE_COUNT * 2 * 3);
    for (let i = 0; i < BIGBANG_PARTICLE_COUNT; i++) {
        const radius = Math.pow(Math.random(), .45) * BIGBANG_MAX_RADIUS;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        particlePos[i * 3] = x;
        particlePos[i * 3 + 1] = y;
        particlePos[i * 3 + 2] = z;
        const t = radius / BIGBANG_MAX_RADIUS;
        const c = t < .4 ? colorHot.clone().lerp(colorMid, t / .4) : colorMid.clone().lerp(colorCool, (t - .4) / .6);
        particleCol[i * 3] = c.r;
        particleCol[i * 3 + 1] = c.g;
        particleCol[i * 3 + 2] = c.b;
        const originScale = .08;
        streakPos[i * 6] = x * originScale;
        streakPos[i * 6 + 1] = y * originScale;
        streakPos[i * 6 + 2] = z * originScale;
        streakPos[i * 6 + 3] = x;
        streakPos[i * 6 + 4] = y;
        streakPos[i * 6 + 5] = z;
    }
    const particleGeo = new THREE.BufferGeometry;
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleCol, 3));
    const burstPoints = new THREE.Points(particleGeo, new THREE.PointsMaterial({
        size: isMobile ? .065 : .056,
        map: particleTex,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: .75,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    group.add(burstPoints);
    const streakGeo = new THREE.BufferGeometry;
    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
    const streakLines = new THREE.LineSegments(streakGeo, new THREE.LineBasicMaterial({
        color: 10237987,
        transparent: true,
        opacity: .08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    group.add(streakLines);
    const shockwaveGeo = new THREE.SphereGeometry(BIGBANG_MAX_RADIUS * 1.08, 24, 16);
    const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 3149836,
        wireframe: true,
        transparent: true,
        opacity: .06,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    group.add(shockwaveMesh);
    const coreMat = new THREE.SpriteMaterial({
        map: createGlowTexWarm("rgba(232,210,200,0.9)", "rgba(201,79,48,0)"),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(.5, .5, 1);
    group.add(core);
    group.visible = false;
    return {
        group: group,
        burstPoints: burstPoints,
        streakLines: streakLines,
        shockwaveMesh: shockwaveMesh,
        core: core,
        coreMat: coreMat
    };
}

const earthPhotoLayer = document.getElementById("earth-photo-layer");

const earthPhotoMain = document.getElementById("earth-photo-main");

function buildWarpStreaks() {
    const count = isMobile ? 130 : 240;
    const pos = new Float32Array(count * 2 * 3);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = .8 + Math.random() * 7;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -45 + Math.random() * 55;
        const len = 2.5 + Math.random() * 5.5;
        pos[i * 6] = x;
        pos[i * 6 + 1] = y;
        pos[i * 6 + 2] = z;
        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = y;
        pos[i * 6 + 5] = z + len;
    }
    const geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
        color: 12575743,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
    }));
    lines.visible = false;
    return lines;
}

const EARTH_DIVE_FRAC = .32;

const EARTH_SCALE_FAR = 1;

const EARTH_SCALE_NEAR = 1.18;

function updateEarthPhotoTransition(progress, direction, swapFraction) {
    let canvasOpacity, layerOpacity, photoScale;
    if (direction === "in") {
        const diveEnd = swapFraction * EARTH_DIVE_FRAC;
        if (progress < diveEnd) {
            canvasOpacity = 1;
            layerOpacity = 0;
            photoScale = EARTH_SCALE_FAR;
        } else {
            const p = (progress - diveEnd) / (1 - diveEnd);
            photoScale = EARTH_SCALE_FAR + (EARTH_SCALE_NEAR - EARTH_SCALE_FAR) * p;
            if (progress < swapFraction) {
                const pFade = (progress - diveEnd) / (swapFraction - diveEnd);
                canvasOpacity = 1 - pFade;
                layerOpacity = pFade;
            } else {
                canvasOpacity = 0;
                layerOpacity = 1;
            }
        }
    } else {
        const diveStart = swapFraction + (1 - swapFraction) * (1 - EARTH_DIVE_FRAC);
        if (progress < diveStart) {
            const p = 1 - progress / diveStart;
            photoScale = EARTH_SCALE_FAR + (EARTH_SCALE_NEAR - EARTH_SCALE_FAR) * p;
            if (progress < swapFraction) {
                canvasOpacity = 0;
                layerOpacity = 1;
            } else {
                const pFade = (progress - swapFraction) / (diveStart - swapFraction);
                canvasOpacity = pFade;
                layerOpacity = 1 - pFade;
            }
        } else {
            canvasOpacity = 1;
            layerOpacity = 0;
            photoScale = EARTH_SCALE_FAR;
        }
    }
    container.style.opacity = String(canvasOpacity);
    if (earthPhotoLayer) earthPhotoLayer.style.opacity = String(layerOpacity);
    if (earthPhotoMain) earthPhotoMain.style.transform = `scale(${photoScale})`;
}

function createGlowTex(inner, outer) {
    const sz = 256;
    const c = document.createElement("canvas");
    c.width = c.height = sz;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, inner);
    g.addColorStop(.3, "rgba(192,132,252,0.5)");
    g.addColorStop(.65, "rgba(109,40,217,0.12)");
    g.addColorStop(1, "rgba(76,29,149,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
}

const coreInnerMat = new THREE.SpriteMaterial({
    map: createGlowTex("rgba(255,240,255,0.95)", "rgba(192,132,252,0.5)"),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const coreInner = new THREE.Sprite(coreInnerMat);

coreInner.scale.set(1.2, 1.2, 1);

const coreOuterMat = new THREE.SpriteMaterial({
    map: createGlowTex("rgba(216,180,254,0.7)", "rgba(109,40,217,0.08)"),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const coreOuter = new THREE.Sprite(coreOuterMat);

coreOuter.scale.set(4.5, 4.5, 1);

const starField = buildStarField();

scene.add(starField);

const nebulaClouds = buildNebulaClouds();

const galaxyGroup = new THREE.Group;

galaxyGroup.rotation.x = 1.05;

galaxyGroup.rotation.z = .22;

const galaxyPoints = buildGalaxy();

const brightStars = buildBrightStars();

const coreBulge = buildCoreBulge();

galaxyGroup.add(galaxyPoints);

galaxyGroup.add(brightStars);

galaxyGroup.add(nebulaClouds);

galaxyGroup.add(coreBulge);

scene.add(galaxyGroup);

scene.add(coreInner);

scene.add(coreOuter);

const observableUniverse = buildObservableUniverse();

scene.add(observableUniverse.group);

const warpStreaks = buildWarpStreaks();

scene.add(warpStreaks);

window.mysticSetScene = function(mode) {
    galaxyGroup.visible = mode === "galaxy";
    coreInner.visible = mode === "galaxy";
    coreOuter.visible = mode === "galaxy";
    observableUniverse.group.visible = mode === "universe";
    starField.visible = mode !== "earth";
    if (mode === "earth") {
        scene.fog.color.setHex(661030);
        scene.fog.density = .03;
    } else {
        scene.fog.color.setHex(328970);
        scene.fog.density = .05;
    }
    container.style.opacity = mode === "earth" ? "0" : "1";
    if (earthPhotoLayer) earthPhotoLayer.style.opacity = mode === "earth" ? "1" : "0";
    if (!dollyState && mode === "earth") {
        if (earthPhotoMain) earthPhotoMain.style.transform = `scale(${EARTH_SCALE_NEAR})`;
    }
};

window.mysticSetScene(document.body.dataset.theme || "earth");

window.mysticStartCameraDolly = function(direction, targetMode, duration, swapFraction, useWarp) {
    dollyState = {
        startTime: performance.now(),
        duration: duration,
        swapFraction: swapFraction,
        swapped: false,
        targetMode: targetMode,
        direction: direction,
        warp: !!useWarp,
        peakZ: direction === "out" ? normalCameraZ * 3.1 : normalCameraZ * .13,
        peakFov: direction === "out" ? BASE_FOV + (useWarp ? 24 : 14) : BASE_FOV + (useWarp ? 30 : 22)
    };
};

window.mysticSkipTransition = function() {
    if (dollyState) dollyState.startTime -= dollyState.duration;
};

let mouseX = 0, mouseY = 0;

window.addEventListener("mousemove", e => {
    mouseX = (e.clientX / window.innerWidth - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
});

window.addEventListener("resize", () => {
    updateCameraForViewport();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock;

function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    if (dollyState) {
        const elapsed = performance.now() - dollyState.startTime;
        const progress = Math.min(elapsed / dollyState.duration, 1);
        if (!dollyState.swapped && progress >= dollyState.swapFraction) {
            dollyState.swapped = true;
            window.mysticSetScene(dollyState.targetMode);
            if (typeof window.mysticOnDollySwap === "function") {
                window.mysticOnDollySwap(dollyState.targetMode);
            }
        }
        let z, fov;
        if (progress < dollyState.swapFraction) {
            const p = progress / dollyState.swapFraction;
            const eased = p * p * p;
            z = normalCameraZ + (dollyState.peakZ - normalCameraZ) * eased;
            fov = BASE_FOV + (dollyState.peakFov - BASE_FOV) * eased;
        } else {
            const p = (progress - dollyState.swapFraction) / (1 - dollyState.swapFraction);
            const eased = 1 - Math.pow(1 - p, 3);
            z = dollyState.peakZ + (normalCameraZ - dollyState.peakZ) * eased;
            fov = dollyState.peakFov + (BASE_FOV - dollyState.peakFov) * eased;
        }
        camera.position.z = z;
        camera.fov = fov;
        camera.updateProjectionMatrix();
        if (dollyState.warp) {
            warpStreaks.visible = true;
            warpStreaks.material.opacity = Math.sin(Math.PI * progress) * .9;
            warpStreaks.position.z = Math.pow(progress, 1.4) * 55;
            updateEarthPhotoTransition(progress, dollyState.direction, dollyState.swapFraction);
        }
        if (progress >= 1) {
            const finishedMode = dollyState.targetMode;
            dollyState = null;
            warpStreaks.visible = false;
            warpStreaks.material.opacity = 0;
            warpStreaks.position.z = 0;
            camera.position.z = normalCameraZ;
            camera.fov = BASE_FOV;
            camera.updateProjectionMatrix();
            container.style.opacity = "";
            if (earthPhotoLayer) earthPhotoLayer.style.opacity = "";
            if (earthPhotoMain) earthPhotoMain.style.transform = "";
            window.mysticSetScene(finishedMode);
        }
    }
    if (!prefersReducedMotion) {
        const t = clock.getElapsedTime();
        galaxyPoints.rotation.y += 8e-4;
        brightStars.rotation.y += 8e-4;
        nebulaClouds.rotation.y += 5e-4;
        coreBulge.rotation.y += 8e-4;
        starField.rotation.y -= 1e-4;
        galaxyGroup.rotation.x = 1.05 + Math.sin(t * .06) * .06;
        galaxyGroup.rotation.z = .22 + Math.cos(t * .05) * .04;
        brightStars.material.opacity = .72 + Math.sin(t * 1.6) * .18;
        const breathe = 1 + Math.sin(t * .45) * .2;
        coreInner.scale.set(1.2 * breathe, 1.2 * breathe, 1);
        coreOuter.scale.set(4.5 * breathe, 4.5 * breathe, 1);
        coreInnerMat.opacity = .8 + Math.sin(t * .45) * .15;
        coreOuterMat.opacity = .65 + Math.sin(t * .45) * .2;
        nebulaClouds.children.forEach((sprite, idx) => {
            sprite.material.opacity = sprite.material.opacity * .998 + (.055 + Math.sin(t * .3 + idx * .7) * .02) * .002;
        });
        if (observableUniverse.group.visible) {
            observableUniverse.group.rotation.y += 18e-5;
            observableUniverse.group.rotation.x = Math.sin(t * .04) * .08;
            const expand = 1 + Math.sin(t * .12) * .045;
            observableUniverse.burstPoints.scale.setScalar(expand);
            observableUniverse.streakLines.scale.setScalar(expand);
            observableUniverse.shockwaveMesh.material.opacity = .045 + Math.sin(t * .15) * .02;
            const breatheU = .9 + Math.sin(t * .5) * .15;
            observableUniverse.core.scale.set(.5 * breatheU, .5 * breatheU, 1);
            observableUniverse.coreMat.opacity = .65 + Math.sin(t * .5) * .15;
        }
        const orbitX = Math.sin(t * .05) * .6;
        const orbitY = Math.cos(t * .04) * .3;
        const targetX = orbitX + mouseX * .5;
        const targetY = orbitY - mouseY * .35;
        camera.position.x += (targetX - camera.position.x) * .018;
        camera.position.y += (targetY - camera.position.y) * .018;
        camera.lookAt(scene.position);
    }
    renderer.render(scene, camera);
}

animate();