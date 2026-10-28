(function () {
    const bgContainer = document.getElementById("bg-canvas-container");
    const docRoot = document.documentElement;
    const earthPhotoLayer = document.getElementById("earth-photo-layer");
    const earthPhotoMain = document.getElementById("earth-photo-main");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactScreen = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const lowSpecHint = compactScreen || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);

    const EARTH_DIVE_FRAC = .32;
    const EARTH_SCALE_FAR = 1;
    const EARTH_SCALE_NEAR = 1.18;

    function setLayerOpacity(mode) {
        bgContainer.style.opacity = mode === "earth" ? "0" : "1";
        if (earthPhotoLayer) earthPhotoLayer.style.opacity = mode === "earth" ? "1" : "0";
    }

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
        bgContainer.style.opacity = String(canvasOpacity);
        if (earthPhotoLayer) earthPhotoLayer.style.opacity = String(layerOpacity);
        if (earthPhotoMain) earthPhotoMain.style.transform = `scale(${photoScale})`;
    }

    function createRenderer() {
        if (typeof THREE === "undefined") return null;
        try {
            const r = new THREE.WebGLRenderer({
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: true
            });
            const gl = r.getContext();
            const info = gl.getExtension("WEBGL_debug_renderer_info");
            const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
            if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) {
                r.dispose();
                return null;
            }
            return r;
        } catch (e) {
            return null;
        }
    }

    const renderer = createRenderer();

    if (!renderer) {
        docRoot.classList.add("no-webgl", "perf-lite");
        let pendingSwap = null;
        window.mysticSetScene = mode => setLayerOpacity(mode);
        window.mysticStartCameraDolly = (direction, targetMode, duration, swapFraction) => {
            clearTimeout(pendingSwap);
            pendingSwap = setTimeout(() => {
                window.mysticSetScene(targetMode);
                if (typeof window.mysticOnDollySwap === "function") window.mysticOnDollySwap(targetMode);
            }, duration * swapFraction);
        };
        window.mysticSkipTransition = () => {};
        window.mysticSetScene(document.body.dataset.theme || "earth");
        return;
    }

    const TAU = Math.PI * 2;
    const BASE_FOV = 55;
    const TIERS = [
        { ratio: .75, density: .38 },
        { ratio: 1, density: .62 },
        { ratio: 1.5, density: 1 }
    ];
    let tier = lowSpecHint ? 1 : 2;

    const rgb = hex => [ (hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255 ];
    const mixRgb = (a, b, t) => [ a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t ];
    const vec3 = hex => {
        const c = rgb(hex);
        return new THREE.Vector3(c[0], c[1], c[2]);
    };
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
    const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const scene = new THREE.Scene;
    const camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, .1, 200);
    scene.add(camera);
    bgContainer.appendChild(renderer.domElement);

    const uTime = { value: 0 };
    const uScale = { value: 1 };
    const densityTargets = [];

    let normalCameraZ = 7.5;
    let dollyState = null;
    let mode = document.body.dataset.theme || "earth";

    function updateScale() {
        uScale.value = renderer.domElement.height * .5 / Math.tan(camera.fov * Math.PI / 360);
    }

    function fitCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        if (aspect < .6) normalCameraZ = 13; else if (aspect < 1) normalCameraZ = 10.5; else if (aspect < 1.4) normalCameraZ = 9; else normalCameraZ = 7.5;
        if (!dollyState) camera.position.z = normalCameraZ;
        camera.updateProjectionMatrix();
    }

    function registerDensity(object, count, stride) {
        object.userData.count = count;
        object.userData.stride = stride || 1;
        densityTargets.push(object);
        object.geometry.setDrawRange(0, Math.floor(count * TIERS[tier].density) * object.userData.stride);
    }

    function applyTier() {
        const t = TIERS[tier];
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, t.ratio));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        densityTargets.forEach(o => o.geometry.setDrawRange(0, Math.floor(o.userData.count * t.density) * o.userData.stride));
        docRoot.classList.toggle("perf-lite", tier < 2);
        docRoot.classList.toggle("perf-min", tier < 1);
        docRoot.dataset.perf = String(tier);
        updateScale();
    }

    fitCamera();
    applyTier();

    const POINT_FRAGMENT = `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            vec2 p = gl_PointCoord - 0.5;
            float d = dot(p, p) * 4.0;
            if (d > 1.0) discard;
            float glow = exp(-d * 2.2) * (1.0 - d * d);
            float core = exp(-d * 22.0);
            gl_FragColor = vec4(vColor + core * 0.32, vAlpha * glow);
        }
    `;

    const BILLBOARD_VERTEX = `
        uniform float uSize;
        uniform float uRot;
        varying vec2 vUv;
        varying float vNear;
        void main() {
            vUv = uv;
            float cs = cos(uRot);
            float sn = sin(uRot);
            vec2 q = vec2(position.x * cs - position.y * sn, position.x * sn + position.y * cs);
            vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            vNear = smoothstep(0.4, 2.4, -mv.z);
            mv.xy += q * uSize;
            gl_Position = projectionMatrix * mv;
        }
    `;

    function additiveMaterial(vertexShader, fragmentShader, uniforms) {
        return new THREE.ShaderMaterial({
            uniforms: Object.assign({ uTime: uTime, uScale: uScale }, uniforms),
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
            blendEquationAlpha: THREE.AddEquation,
            blendSrcAlpha: THREE.ZeroFactor,
            blendDstAlpha: THREE.OneFactor
        });
    }

    function billboard(fragmentShader, uniforms, size) {
        const material = additiveMaterial(BILLBOARD_VERTEX, fragmentShader, Object.assign({
            uSize: { value: size },
            uRot: { value: 0 }
        }, uniforms));
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.frustumCulled = false;
        return mesh;
    }

    function cloudTexture(blobs) {
        const size = 128;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d");
        ctx.globalCompositeOperation = "lighter";
        ctx.setTransform(1, 0, 0, .42, 0, size * .29);
        for (let i = 0; i < blobs; i++) {
            const x = size / 2 + gauss() * size * .26;
            const y = size / 2 + gauss() * size * .2;
            const rad = size * (.05 + Math.random() * .13);
            const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
            g.addColorStop(0, `rgba(255,255,255,${.1 + Math.random() * .16})`);
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, size, size);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "destination-in";
        const mask = ctx.createRadialGradient(size / 2, size / 2, size * .08, size / 2, size / 2, size / 2);
        mask.addColorStop(0, "rgba(0,0,0,1)");
        mask.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mask;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    const STAR_VERTEX = `
        attribute vec3 aColor;
        attribute vec2 aSeed;
        uniform float uTime;
        uniform float uScale;
        uniform float uAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = 0.06 * aSeed.y * uScale / -mv.z;
            float tw = 0.7 + 0.3 * sin(uTime * (0.5 + fract(aSeed.x * 7.13) * 1.6) + aSeed.x);
            gl_PointSize = clamp(s, 1.0, 8.0);
            vAlpha = uAlpha * tw * clamp(s, 0.25, 1.0);
            vColor = aColor;
        }
    `;

    function buildStarfield() {
        const count = 3200;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const seed = new Float32Array(count * 2);
        const tints = [ 0xffffff, 0xd6e8ff, 0xffe6c9, 0xf1d9ff, 0xa9d6ff, 0xffc2e4 ].map(rgb);
        for (let i = 0; i < count; i++) {
            const r = 24 + Math.random() * 36;
            const th = Math.random() * TAU;
            const ph = Math.acos(Math.random() * 2 - 1);
            pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
            pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
            pos[i * 3 + 2] = r * Math.cos(ph);
            const c = tints[Math.floor(Math.random() * tints.length)];
            const b = .35 + Math.pow(Math.random(), 2.2) * .75;
            col[i * 3] = c[0] * b;
            col[i * 3 + 1] = c[1] * b;
            col[i * 3 + 2] = c[2] * b;
            seed[i * 2] = Math.random() * TAU;
            seed[i * 2 + 1] = Math.random() < .04 ? 2.4 + Math.random() : .7 + Math.random() * .9;
        }
        const geo = new THREE.BufferGeometry;
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
        const points = new THREE.Points(geo, additiveMaterial(STAR_VERTEX, POINT_FRAGMENT, {
            uAlpha: { value: .9 }
        }));
        points.frustumCulled = false;
        registerDensity(points, count);
        points.visible = false;
        return points;
    }

    const GALAXY_RADIUS = 5.6;

    const GALAXY_VERTEX = `
        attribute vec4 aOrbit;
        attribute vec3 aColor;
        attribute vec2 aSeed;
        uniform float uTime;
        uniform float uScale;
        uniform float uSpin;
        uniform float uForm;
        uniform float uAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float f = uForm;
            float r = aOrbit.x * (1.0 + (1.0 - f) * 1.6);
            float a = aOrbit.y + uSpin + (1.0 - f) * (2.6 / (aOrbit.x + 0.5));
            vec3 p = vec3(cos(a) * r, aOrbit.z * (1.0 + (1.0 - f) * 2.0), sin(a) * r);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = aOrbit.w * uScale / -mv.z;
            float tw = 1.0 + aSeed.y * sin(uTime * (1.4 + aSeed.x * 0.35) + aSeed.x * 6.2831);
            float reveal = smoothstep(0.0, 1.0, f * 1.6 - aOrbit.x / 9.0);
            gl_PointSize = clamp(s, 1.0, 24.0);
            vAlpha = uAlpha * tw * reveal * clamp(s * s, 0.15, 1.0) * smoothstep(0.25, 1.4, -mv.z);
            vColor = aColor;
        }
    `;

    function pickArm() {
        const r = Math.random();
        if (r < .36) return 0;
        if (r < .72) return 2;
        if (r < .86) return 1;
        return 3;
    }

    function galaxyPoints(count, fill, uniforms) {
        const orbit = new Float32Array(count * 4);
        const col = new Float32Array(count * 3);
        const seed = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            const s = fill();
            orbit[i * 4] = s.r;
            orbit[i * 4 + 1] = s.a;
            orbit[i * 4 + 2] = s.h;
            orbit[i * 4 + 3] = s.size;
            col[i * 3] = s.c[0] * s.b;
            col[i * 3 + 1] = s.c[1] * s.b;
            col[i * 3 + 2] = s.c[2] * s.b;
            seed[i * 2] = Math.random() * TAU;
            seed[i * 2 + 1] = s.tw;
        }
        const geo = new THREE.BufferGeometry;
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        geo.setAttribute("aOrbit", new THREE.BufferAttribute(orbit, 4));
        geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
        const points = new THREE.Points(geo, additiveMaterial(GALAXY_VERTEX, POINT_FRAGMENT, uniforms));
        points.frustumCulled = false;
        registerDensity(points, count);
        return points;
    }

    const NEBULA_FRAGMENT = `
        uniform sampler2D uMap;
        uniform vec3 uColor;
        uniform float uAlpha;
        varying vec2 vUv;
        varying float vNear;
        void main() {
            float a = texture2D(uMap, vUv).a;
            gl_FragColor = vec4(uColor, a * 2.2 * uAlpha * vNear);
        }
    `;

    const GLOW_FRAGMENT = `
        uniform vec3 uInner;
        uniform vec3 uOuter;
        uniform float uIntensity;
        varying vec2 vUv;
        varying float vNear;
        void main() {
            float d = length(vUv - 0.5) * 2.0;
            float edge = 1.0 - smoothstep(0.6, 1.0, d);
            float halo = exp(-d * 3.4) * edge;
            float core = exp(-d * d * 34.0);
            vec3 c = uOuter * halo + uInner * core * 1.3;
            gl_FragColor = vec4(c * uIntensity * vNear, 1.0);
        }
    `;

    function buildGalaxy() {
        const group = new THREE.Group;
        group.rotation.x = 1.16;
        group.rotation.z = .28;
        const uniforms = {
            uSpin: { value: 0 },
            uForm: { value: 1 },
            uAlpha: { value: 1 }
        };
        const cCore = rgb(0xfff4e6);
        const cWarm = rgb(0xffe2c2);
        const cPink = rgb(0xe4dcff);
        const cViolet = rgb(0xaebcff);
        const cDeep = rgb(0x7486f0);
        const cIndigo = rgb(0x4253c4);
        const cYoung = rgb(0xb5d6ff);
        const cKnot = rgb(0xe48bc4);
        const white = [ 1, 1, 1 ];
        const disk = galaxyPoints(compactScreen ? 16000 : 30000, () => {
            const diffuse = Math.random() < .32;
            let r = diffuse ? -Math.log(1 - Math.random() * .985) * 1.7 : Math.pow(Math.random(), .62) * GALAXY_RADIUS + .04;
            r = Math.min(r, GALAXY_RADIUS * 1.08);
            let a;
            let offset = 0;
            if (diffuse) {
                a = Math.random() * TAU;
            } else {
                offset = (.16 + .6 * r / GALAXY_RADIUS) * gauss() * 2.7;
                a = pickArm() / 4 * TAU + r * .92 + offset / Math.max(r, .45);
                r += gauss() * (.12 + .3 * r / GALAXY_RADIUS);
            }
            r = Math.max(r, .03);
            const t = Math.min(r / GALAXY_RADIUS, 1);
            let c;
            if (t < .08) c = mixRgb(cCore, cWarm, t / .08); else if (t < .3) c = mixRgb(cWarm, cPink, (t - .08) / .22); else if (t < .62) c = mixRgb(cPink, cViolet, (t - .3) / .32); else if (t < .82) c = mixRgb(cViolet, cDeep, (t - .62) / .2); else c = mixRgb(cDeep, cIndigo, (t - .82) / .18);
            let size = .03 + Math.random() * .012;
            let b = (diffuse ? .4 : .66 + Math.random() * .24) * (1 - t * .38);
            let tw = 0;
            if (!diffuse && t > .12) {
                const roll = Math.random();
                if (roll < .06) {
                    c = mixRgb(cYoung, white, Math.random() * .3);
                    size *= 1.8;
                    b = .9;
                    tw = .25;
                } else if (roll < .085) {
                    c = cKnot;
                    size *= 2.1;
                    b = .72;
                    tw = .15;
                } else if (offset < 0 && offset > -(.14 + t * .22)) {
                    b *= .22;
                }
            }
            if (t < .1) b = .9;
            return { r: r, a: a, h: gauss() * (.05 + .34 * Math.exp(-r * 1.25)), size: size, c: c, b: b, tw: tw };
        }, uniforms);
        const bulge = galaxyPoints(compactScreen ? 1400 : 2600, () => {
            const rr = Math.pow(Math.random(), 1.9) * 1.15;
            const th = Math.random() * TAU;
            const ph = Math.acos(Math.random() * 2 - 1);
            const x = rr * Math.sin(ph) * Math.cos(th) * 1.5;
            const z = rr * Math.sin(ph) * Math.sin(th);
            const t = rr / 1.15;
            const c = t < .4 ? mixRgb(white, rgb(0xfff0dc), t / .4) : mixRgb(rgb(0xfff0dc), rgb(0xe9dcff), (t - .4) / .6);
            return { r: Math.hypot(x, z), a: Math.atan2(z, x), h: rr * Math.cos(ph) * .55, size: .03, c: c, b: .8, tw: 0 };
        }, uniforms);
        group.add(disk);
        group.add(bulge);
        const nebulaGroup = new THREE.Group;
        const clouds = [ cloudTexture(30), cloudTexture(38), cloudTexture(24) ];
        const nebulaTints = [ 0x8a96ff, 0xa08be6, 0x6fa4e0, 0xc98ab8, 0x7c86e8, 0x9fb4ff ];
        const nebulae = [];
        for (let i = 0; i < 12; i++) {
            const r = 1 + Math.random() * 3.8;
            const a = (i % 2 === 0 ? 0 : .5) * TAU + r * .92 + gauss() * .16;
            const intensity = .1 + Math.random() * .1;
            const mesh = billboard(NEBULA_FRAGMENT, {
                uMap: { value: clouds[i % clouds.length] },
                uColor: { value: vec3(nebulaTints[i % nebulaTints.length]) },
                uAlpha: { value: intensity }
            }, 1.4 + Math.random() * 1.8);
            mesh.material.uniforms.uRot.value = a + Math.PI / 2 + gauss() * .3;
            mesh.position.set(Math.cos(a) * r, gauss() * .12, Math.sin(a) * r);
            mesh.userData.base = intensity;
            mesh.userData.phase = Math.random() * TAU;
            nebulaGroup.add(mesh);
            nebulae.push(mesh);
        }
        group.add(nebulaGroup);
        const coreOuter = billboard(GLOW_FRAGMENT, {
            uInner: { value: vec3(0xfff0e6) },
            uOuter: { value: vec3(0x6f73c8) },
            uIntensity: { value: .55 }
        }, 4.6);
        const coreInner = billboard(GLOW_FRAGMENT, {
            uInner: { value: vec3(0xffffff) },
            uOuter: { value: vec3(0xffd9c2) },
            uIntensity: { value: .7 }
        }, 1.3);
        group.add(coreOuter);
        group.add(coreInner);
        group.visible = false;
        let formStart = -1;
        return {
            group: group,
            form() {
                formStart = reducedMotion ? -1 : uTime.value;
                uniforms.uForm.value = reducedMotion ? 1 : 0;
            },
            update(t) {
                if (formStart >= 0) {
                    const p = clamp01((t - formStart) / 2.6);
                    uniforms.uForm.value = easeOutCubic(p);
                    if (p >= 1) formStart = -1;
                }
                const f = uniforms.uForm.value;
                uniforms.uSpin.value = t * .045;
                nebulaGroup.rotation.y = -uniforms.uSpin.value;
                group.rotation.x = 1.16 + Math.sin(t * .06) * .05;
                group.rotation.z = .28 + Math.cos(t * .05) * .04;
                nebulae.forEach(n => {
                    n.material.uniforms.uAlpha.value = n.userData.base * f * (.8 + .2 * Math.sin(t * .3 + n.userData.phase));
                });
                const breathe = 1 + Math.sin(t * .45) * .16;
                coreInner.material.uniforms.uSize.value = 1.3 * breathe;
                coreOuter.material.uniforms.uSize.value = 4.6 * breathe * (.5 + .5 * f);
                coreInner.material.uniforms.uIntensity.value = (.62 + Math.sin(t * .45) * .08) * (.4 + .6 * f);
                coreOuter.material.uniforms.uIntensity.value = (.48 + Math.sin(t * .45) * .1) * f;
            }
        };
    }

    const UNIVERSE_RADIUS = 4.6;

    const COSMIC_FRAGMENT = `
        uniform sampler2D uMap;
        uniform float uAlpha;
        varying vec2 vUv;
        varying float vNear;
        void main() {
            vec4 t = texture2D(uMap, vUv);
            gl_FragColor = vec4(t.rgb, t.a * uAlpha * vNear);
        }
    `;

    const SINGULARITY_FRAGMENT = `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uHot;
        uniform vec3 uWarm;
        uniform vec3 uCool;
        varying vec2 vUv;
        varying float vNear;
        void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float d = length(p);
            float edge = 1.0 - smoothstep(0.7, 1.0, d);
            float core = exp(-d * d * 120.0) * 1.5;
            float inner = exp(-d * 10.0) * 0.5;
            float halo = exp(-d * 3.2) * 0.3 * edge;
            float ring = exp(-pow((d - 0.3) / 0.03, 2.0)) * 0.3 * (0.8 + 0.2 * sin(uTime * 0.6));
            float flare = exp(-abs(p.y) * 70.0) * exp(-abs(p.x) * 3.2) * 0.2 * edge;
            float pulse = 0.95 + 0.05 * sin(uTime * 0.8);
            vec3 c = uHot * (core + inner * 0.5 + flare) + uWarm * (inner * 0.5 + halo) + mix(uWarm, uCool, 0.65) * ring;
            gl_FragColor = vec4(c * uIntensity * pulse * vNear, 1.0);
        }
    `;

    const DUST_VERTEX = `
        attribute vec4 aOrbit;
        attribute vec3 aColor;
        attribute vec2 aSeed;
        uniform float uTime;
        uniform float uScale;
        uniform float uBirth;
        uniform float uAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float bang = 1.0 - pow(1.0 - uBirth, 3.0);
            float r = aOrbit.x * (0.06 + 0.94 * bang);
            float a = aOrbit.y + uTime * (0.035 + 0.06 / (1.0 + aOrbit.x));
            vec3 p = vec3(cos(a) * r, aOrbit.z * bang, sin(a) * r);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = aOrbit.w * uScale / -mv.z;
            float tw = 0.75 + 0.25 * sin(uTime * (0.5 + aSeed.x) + aSeed.y * 6.2831);
            gl_PointSize = clamp(s, 1.0, 16.0);
            vAlpha = uAlpha * tw * clamp(s * s, 0.12, 1.0) * smoothstep(0.25, 1.4, -mv.z);
            vColor = aColor * (1.0 + (1.0 - uBirth) * 1.2);
        }
    `;

    const STREAM_VERTEX = `
        attribute vec4 aSeed;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uScale;
        uniform float uBirth;
        uniform float uAlpha;
        uniform float uRadius;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float life = fract(uTime * 0.035 * aSeed.z + aSeed.y);
            float reach = smoothstep(0.0, 1.0, uBirth * 1.3 - life * 0.3);
            float r = mix(0.22, uRadius, pow(life, 0.85));
            float a = aSeed.x + r * 0.62 + uTime * 0.05;
            float wave = sin(r * 1.7 + aSeed.x * 3.0 + uTime * 0.4) * 0.22;
            vec3 side = vec3(-sin(a), 0.0, cos(a));
            vec3 p = vec3(cos(a) * r, wave + aSeed.w * 0.08, sin(a) * r) + side * aSeed.w * (0.06 + 0.16 * life);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = (0.05 * (1.0 - life) + 0.02) * uScale / -mv.z;
            gl_PointSize = clamp(s, 1.0, 14.0);
            float fade = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.5, 1.0, life));
            vAlpha = uAlpha * fade * reach * clamp(s * s, 0.12, 1.0) * smoothstep(0.25, 1.4, -mv.z);
            vColor = aColor;
        }
    `;

    const WEB_VERTEX = `
        attribute vec3 aColor;
        attribute vec2 aSeed;
        uniform float uTime;
        uniform float uScale;
        uniform float uReveal;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = aSeed.y * uScale / -mv.z;
            float tw = 0.8 + 0.2 * sin(uTime * 0.9 + aSeed.x * 6.2831);
            gl_PointSize = clamp(s, 1.0, 14.0);
            vAlpha = uReveal * tw * clamp(s * s, 0.15, 1.0) * smoothstep(0.4, 2.0, -mv.z);
            vColor = aColor;
        }
    `;

    function randomUnit() {
        const z = Math.random() * 2 - 1;
        const a = Math.random() * TAU;
        const s = Math.sqrt(1 - z * z);
        return [ s * Math.cos(a), s * Math.sin(a), z ];
    }

    function cosmicTexture(size, o) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d");
        const half = size / 2;
        const stops = o.palette.map(rgb);
        const paint = (x, y, rad, col, a) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
            const v = `${Math.round(col[0] * 255)},${Math.round(col[1] * 255)},${Math.round(col[2] * 255)}`;
            g.addColorStop(0, `rgba(${v},${a})`);
            g.addColorStop(.55, `rgba(${v},${a * .35})`);
            g.addColorStop(1, `rgba(${v},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        };
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < o.blobs; i++) {
            const arm = i % o.arms;
            const t = Math.pow(Math.random(), o.spread);
            const r = (o.inner + t * (.46 - o.inner)) * size;
            const ang = arm / o.arms * TAU + t * o.twist + gauss() * o.scatter;
            const k = Math.min(t * (stops.length - 1), stops.length - 1.001);
            const i0 = Math.floor(k);
            const col = mixRgb(stops[i0], stops[i0 + 1], k - i0);
            paint(half + Math.cos(ang) * r, half + Math.sin(ang) * r, size * (.025 + Math.random() * .07) * (.55 + t * .9), col, o.alpha * (.45 + Math.random() * .55));
        }
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < o.lanes; i++) {
            const arm = i % o.arms;
            const t = Math.random();
            const r = (o.inner + t * (.44 - o.inner)) * size;
            const ang = arm / o.arms * TAU + t * o.twist - .24 + gauss() * .05;
            paint(half + Math.cos(ang) * r, half + Math.sin(ang) * r, size * (.012 + Math.random() * .03), [ 0, 0, 0 ], .1 + Math.random() * .18);
        }
        ctx.globalCompositeOperation = "destination-in";
        const mask = ctx.createRadialGradient(half, half, size * .12, half, half, half);
        mask.addColorStop(0, "rgba(0,0,0,1)");
        mask.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mask;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    function buildCosmicWeb(count) {
        const nodes = [];
        for (let i = 0; i < 28; i++) {
            const d = randomUnit();
            const r = 6.5 + Math.random() * 7;
            nodes.push([ d[0] * r, d[1] * r, d[2] * r ]);
        }
        const links = [];
        nodes.forEach((n, i) => {
            const near = nodes.map((m, j) => ({ j: j, d: Math.hypot(n[0] - m[0], n[1] - m[1], n[2] - m[2]) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 2);
            near.forEach(o => {
                if (!links.some(l => l[0] === o.j && l[1] === i)) links.push([ i, o.j ]);
            });
        });
        const tints = [ 0x6f7fd8, 0xc0607a, 0xd08a5a, 0x4f9fb8, 0x8f6fd0 ].map(rgb);
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const seed = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            let p, c, b, size;
            if (Math.random() < .35) {
                const k = Math.floor(Math.random() * nodes.length);
                const n = nodes[k];
                p = [ n[0] + gauss() * .45, n[1] + gauss() * .45, n[2] + gauss() * .45 ];
                c = tints[k % tints.length];
                b = .36 + Math.random() * .24;
                size = .045;
            } else {
                const l = links[Math.floor(Math.random() * links.length)];
                const a = nodes[l[0]];
                const e = nodes[l[1]];
                const t = Math.random();
                const j = .22 * (.4 + Math.sin(t * Math.PI));
                p = [ a[0] + (e[0] - a[0]) * t + gauss() * j, a[1] + (e[1] - a[1]) * t + gauss() * j, a[2] + (e[2] - a[2]) * t + gauss() * j ];
                c = mixRgb(tints[l[0] % tints.length], tints[l[1] % tints.length], t);
                b = .16 + Math.random() * .2;
                size = .032;
            }
            pos.set(p, i * 3);
            col[i * 3] = c[0] * b;
            col[i * 3 + 1] = c[1] * b;
            col[i * 3 + 2] = c[2] * b;
            seed[i * 2] = Math.random();
            seed[i * 2 + 1] = size;
        }
        const geo = new THREE.BufferGeometry;
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
        const uniforms = { uReveal: { value: 1 } };
        const points = new THREE.Points(geo, additiveMaterial(WEB_VERTEX, POINT_FRAGMENT, uniforms));
        points.frustumCulled = false;
        registerDensity(points, count);
        return { points: points, uniforms: uniforms };
    }

    const COSMIC_LAYERS = [
        { size: 640, scale: 14, spin: .006, delay: .16, alpha: .9, opts: { blobs: 520, arms: 3, twist: 3.4, spread: .9, inner: .1, scatter: .35, alpha: .085, lanes: 70, palette: [ 0xd9925a, 0xb04a6a, 0x5a3f9e, 0x1f6f8c, 0x14324f ] } },
        { size: 512, scale: 8.6, spin: -.012, delay: .08, alpha: .85, opts: { blobs: 400, arms: 2, twist: 4.2, spread: .85, inner: .05, scatter: .28, alpha: .1, lanes: 60, palette: [ 0xffd6a0, 0xe08a4a, 0xa24a78, 0x3f5fae, 0x2a8aa0 ] } },
        { size: 384, scale: 4.4, spin: .028, delay: 0, alpha: .8, opts: { blobs: 280, arms: 4, twist: 5, spread: .8, inner: .02, scatter: .22, alpha: .12, lanes: 40, palette: [ 0xfff1dc, 0xffc27a, 0xe0703a, 0x9a3f6a ] } }
    ];

    const STREAM_COLORS = [ 0x5b8cff, 0xd9485f, 0x9a62e0, 0xe8c25a, 0x4fbf8a, 0xe58a45 ];

    function buildUniverse() {
        const group = new THREE.Group;
        const disk = new THREE.Group;
        disk.rotation.x = 1.08;
        disk.rotation.z = .32;
        group.add(disk);
        const uBirth = { value: 1 };
        const uRadius = { value: UNIVERSE_RADIUS };
        const layers = COSMIC_LAYERS.map(l => {
            const mesh = billboard(COSMIC_FRAGMENT, {
                uMap: { value: cosmicTexture(compactScreen ? Math.round(l.size * .75) : l.size, l.opts) },
                uAlpha: { value: l.alpha }
            }, l.scale);
            mesh.userData.layer = l;
            mesh.userData.rot = Math.random() * TAU;
            group.add(mesh);
            return mesh;
        });
        const dustCount = compactScreen ? 5000 : 9000;
        const dustOrbit = new Float32Array(dustCount * 4);
        const dustColor = new Float32Array(dustCount * 3);
        const dustSeed = new Float32Array(dustCount * 2);
        const dWarm = rgb(0xffe6c4);
        const dRose = rgb(0xd98a9a);
        const dTeal = rgb(0x7fb6d0);
        for (let i = 0; i < dustCount; i++) {
            const halo = Math.random() < .25;
            const r = Math.min(-Math.log(1 - Math.random() * .98) * 1.25 + .15, UNIVERSE_RADIUS * 1.15);
            const t = Math.min(r / UNIVERSE_RADIUS, 1);
            const c = t < .4 ? mixRgb(dWarm, dRose, t / .4) : mixRgb(dRose, dTeal, (t - .4) / .6);
            const bright = Math.random() < .03;
            const b = (bright ? .95 : .4 + Math.random() * .4) * (1 - t * .35);
            dustOrbit[i * 4] = r;
            dustOrbit[i * 4 + 1] = Math.random() * TAU;
            dustOrbit[i * 4 + 2] = halo ? gauss() * r * .7 : gauss() * (.05 + .12 * t);
            dustOrbit[i * 4 + 3] = bright ? .045 : .02 + Math.random() * .016;
            dustColor[i * 3] = c[0] * b;
            dustColor[i * 3 + 1] = c[1] * b;
            dustColor[i * 3 + 2] = c[2] * b;
            dustSeed[i * 2] = Math.random();
            dustSeed[i * 2 + 1] = Math.random();
        }
        const dustGeo = new THREE.BufferGeometry;
        dustGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(dustCount * 3), 3));
        dustGeo.setAttribute("aOrbit", new THREE.BufferAttribute(dustOrbit, 4));
        dustGeo.setAttribute("aColor", new THREE.BufferAttribute(dustColor, 3));
        dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 2));
        const dust = new THREE.Points(dustGeo, additiveMaterial(DUST_VERTEX, POINT_FRAGMENT, {
            uBirth: uBirth,
            uAlpha: { value: .85 }
        }));
        dust.frustumCulled = false;
        registerDensity(dust, dustCount);
        disk.add(dust);
        const perStream = compactScreen ? 200 : 380;
        const streamCount = perStream * STREAM_COLORS.length;
        const streamSeed = new Float32Array(streamCount * 4);
        const streamColor = new Float32Array(streamCount * 3);
        const grey = [ .62, .62, .66 ];
        for (let i = 0; i < streamCount; i++) {
            const k = i % STREAM_COLORS.length;
            const c = mixRgb(rgb(STREAM_COLORS[k]), grey, .22);
            streamSeed[i * 4] = k / STREAM_COLORS.length * TAU;
            streamSeed[i * 4 + 1] = Math.random();
            streamSeed[i * 4 + 2] = .8 + Math.random() * .4;
            streamSeed[i * 4 + 3] = gauss();
            streamColor[i * 3] = c[0];
            streamColor[i * 3 + 1] = c[1];
            streamColor[i * 3 + 2] = c[2];
        }
        const streamGeo = new THREE.BufferGeometry;
        streamGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(streamCount * 3), 3));
        streamGeo.setAttribute("aSeed", new THREE.BufferAttribute(streamSeed, 4));
        streamGeo.setAttribute("aColor", new THREE.BufferAttribute(streamColor, 3));
        const streams = new THREE.Points(streamGeo, additiveMaterial(STREAM_VERTEX, POINT_FRAGMENT, {
            uBirth: uBirth,
            uRadius: uRadius,
            uAlpha: { value: .55 }
        }));
        streams.frustumCulled = false;
        registerDensity(streams, streamCount);
        disk.add(streams);
        const web = buildCosmicWeb(compactScreen ? 2200 : 4000);
        group.add(web.points);
        const core = billboard(SINGULARITY_FRAGMENT, {
            uIntensity: { value: .85 },
            uHot: { value: vec3(0xfff4e4) },
            uWarm: { value: vec3(0xf2a35e) },
            uCool: { value: vec3(0x6fc6d8) }
        }, 2.6);
        group.add(core);
        group.visible = false;
        let birthStart = -1;
        return {
            group: group,
            birth() {
                birthStart = reducedMotion ? -1 : uTime.value;
                uBirth.value = reducedMotion ? 1 : 0;
            },
            birthLevel: () => uBirth.value,
            update(t) {
                if (birthStart >= 0) {
                    const p = clamp01((t - birthStart) / 4.6);
                    uBirth.value = p;
                    if (p >= 1) birthStart = -1;
                }
                const b = uBirth.value;
                const flash = Math.pow(1 - b, 2);
                layers.forEach(m => {
                    const l = m.userData.layer;
                    const local = clamp01((b - l.delay) / (1 - l.delay));
                    const e = easeOutCubic(local);
                    const u = m.material.uniforms;
                    u.uSize.value = l.scale * (.1 + .9 * e) * (1 + Math.sin(t * .07 + l.scale) * .025);
                    u.uRot.value = m.userData.rot + t * l.spin + (1 - e) * 1.4;
                    u.uAlpha.value = l.alpha * Math.min(1, local * 3);
                });
                core.material.uniforms.uIntensity.value = .85 + flash * 2.6;
                core.material.uniforms.uSize.value = 2.6 * (1 + (1 - b) * 1.2) * (1 + Math.sin(t * .5) * .04);
                web.uniforms.uReveal.value = clamp01((b - .4) / .6);
                disk.rotation.x = 1.08 + Math.sin(t * .05) * .04;
                group.rotation.y = Math.sin(t * .03) * .12;
            }
        };
    }

    const LINE_FRAGMENT = `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            gl_FragColor = vec4(vColor, vAlpha);
        }
    `;

    const WARP_VERTEX = `
        attribute vec4 aSeed;
        attribute float aEnd;
        uniform float uTravel;
        uniform float uStretch;
        uniform float uAlpha;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float head = mod(aSeed.z + uTravel, 60.0) - 60.0;
            float z = head - (1.0 - aEnd) * aSeed.w * uStretch;
            vec3 p = vec3(cos(aSeed.x) * aSeed.y, sin(aSeed.x) * aSeed.y, z);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            float depth = smoothstep(-60.0, -38.0, head) * (1.0 - smoothstep(-2.0, -0.4, head));
            vAlpha = uAlpha * aEnd * depth;
            vColor = mix(uColorA, uColorB, fract(aSeed.x * 3.7));
        }
    `;

    const WARP_COLORS = {
        earth: [ 0x7fd8ff, 0xf5b75c ],
        galaxy: [ 0xc9c2ff, 0x7fb4ff ],
        universe: [ 0xffc78f, 0x4fb8c8 ]
    };

    function buildWarp() {
        const count = compactScreen ? 240 : 460;
        const seed = new Float32Array(count * 8);
        const end = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            const s = [ Math.random() * TAU, .5 + Math.pow(Math.random(), .7) * 7, Math.random() * 60, 1.5 + Math.random() * 4 ];
            seed.set(s, i * 8);
            seed.set(s, i * 8 + 4);
            end[i * 2] = 0;
            end[i * 2 + 1] = 1;
        }
        const geo = new THREE.BufferGeometry;
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
        geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
        const material = additiveMaterial(WARP_VERTEX, LINE_FRAGMENT, {
            uTravel: { value: 0 },
            uStretch: { value: 1 },
            uAlpha: { value: 0 },
            uColorA: { value: new THREE.Vector3 },
            uColorB: { value: new THREE.Vector3 }
        });
        const lines = new THREE.LineSegments(geo, material);
        lines.frustumCulled = false;
        lines.visible = false;
        registerDensity(lines, count, 2);
        camera.add(lines);
        return lines;
    }

    let starfield = null;
    let galaxy = null;
    let universe = null;
    let warp = null;

    function precompile(object) {
        const wasVisible = object.visible;
        object.visible = true;
        try {
            renderer.compile(scene, camera);
        } catch (e) {}
        object.visible = wasVisible;
    }

    function ensureStarfield() {
        if (!starfield) {
            starfield = buildStarfield();
            scene.add(starfield);
            precompile(starfield);
        }
        return starfield;
    }

    function ensureGalaxy() {
        if (!galaxy) {
            galaxy = buildGalaxy();
            scene.add(galaxy.group);
            precompile(galaxy.group);
        }
        return galaxy;
    }

    function ensureUniverse() {
        if (!universe) {
            universe = buildUniverse();
            scene.add(universe.group);
            precompile(universe.group);
        }
        return universe;
    }

    function ensureWarp() {
        if (!warp) {
            warp = buildWarp();
            precompile(warp);
        }
        return warp;
    }

    function applyMode(next) {
        const changed = next !== mode;
        mode = next;
        if (next !== "earth") ensureStarfield().visible = true; else if (starfield) starfield.visible = false;
        if (next === "galaxy") ensureGalaxy();
        if (next === "universe") ensureUniverse();
        if (galaxy) galaxy.group.visible = next === "galaxy";
        if (universe) universe.group.visible = next === "universe";
        if (changed && next === "galaxy") galaxy.form();
        if (changed && next === "universe") universe.birth();
    }

    function ensureLoop() {
        if (looping) return;
        looping = true;
        lastNow = performance.now();
        requestAnimationFrame(frame);
    }

    window.mysticSetScene = function (next) {
        applyMode(next);
        setLayerOpacity(next);
        needsRender = true;
        ensureLoop();
        if (!dollyState && next === "earth" && earthPhotoMain) earthPhotoMain.style.transform = `scale(${EARTH_SCALE_NEAR})`;
    };

    window.mysticStartCameraDolly = function (direction, targetMode, duration, swapFraction, useWarp) {
        ensureWarp();
        if (targetMode === "galaxy" || mode === "galaxy") ensureGalaxy();
        if (targetMode === "universe" || mode === "universe") ensureUniverse();
        ensureStarfield();
        const from = WARP_COLORS[mode] || WARP_COLORS.galaxy;
        const to = WARP_COLORS[targetMode] || WARP_COLORS.galaxy;
        const ca = rgb(from[0]);
        const cb = rgb(to[1]);
        warp.material.uniforms.uColorA.value.set(ca[0], ca[1], ca[2]);
        warp.material.uniforms.uColorB.value.set(cb[0], cb[1], cb[2]);
        dollyState = {
            startTime: performance.now(),
            duration: duration,
            swapFraction: swapFraction,
            swapped: false,
            targetMode: targetMode,
            direction: direction,
            warp: !!useWarp,
            streak: useWarp ? .7 : 0,
            peakZ: direction === "out" ? normalCameraZ * 3.1 : normalCameraZ * .13,
            peakFov: direction === "out" ? BASE_FOV + (useWarp ? 24 : 16) : BASE_FOV + (useWarp ? 30 : 24)
        };
        ensureLoop();
    };

    window.mysticSkipTransition = function () {
        if (dollyState) dollyState.startTime -= dollyState.duration;
    };

    window.mysticFinishDolly = function () {
        if (!dollyState) return;
        const target = dollyState.targetMode;
        dollyState = null;
        settleCamera();
        window.mysticSetScene(target);
    };

    let pointerX = 0;
    let pointerY = 0;
    let camX = 0;
    let camY = 0;
    let warpTravel = 0;
    let elapsed = 0;
    let lastNow = performance.now();
    let throttleAcc = 0;
    let needsRender = true;
    let deepScroll = false;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let resizeQueued = false;
    let looping = false;
    const governor = { ema: 1 / 60, slow: 0, frames: 0 };
    const lookTarget = new THREE.Vector3;

    window.addEventListener("pointermove", e => {
        pointerX = (e.clientX / window.innerWidth - .5) * 2;
        pointerY = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });

    window.addEventListener("scroll", () => {
        deepScroll = window.scrollY > window.innerHeight * 1.1;
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(() => {
            resizeQueued = false;
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (compactScreen && w === lastWidth && Math.abs(h - lastHeight) < 160) return;
            lastWidth = w;
            lastHeight = h;
            fitCamera();
            renderer.setSize(w, h, false);
            updateScale();
            needsRender = true;
            ensureLoop();
        });
    });

    function govern(dt) {
        governor.frames++;
        governor.ema += (dt - governor.ema) * .06;
        if (governor.frames < 90) return;
        if (governor.ema > 1 / 42) governor.slow += dt; else governor.slow = Math.max(0, governor.slow - dt * .5);
        if (governor.slow > 2.2 && tier > 0) {
            tier--;
            applyTier();
            governor.slow = 0;
            governor.frames = 0;
            governor.ema = 1 / 60;
        }
    }

    function stepDolly(now, dt) {
        const d = dollyState;
        const progress = Math.min((now - d.startTime) / d.duration, 1);
        if (!d.swapped && progress >= d.swapFraction) {
            d.swapped = true;
            window.mysticSetScene(d.targetMode);
            if (typeof window.mysticOnDollySwap === "function") window.mysticOnDollySwap(d.targetMode);
        }
        let z, fov;
        if (progress < d.swapFraction) {
            const p = progress / d.swapFraction;
            const eased = p * p * p;
            z = normalCameraZ + (d.peakZ - normalCameraZ) * eased;
            fov = BASE_FOV + (d.peakFov - BASE_FOV) * eased;
        } else {
            const p = (progress - d.swapFraction) / (1 - d.swapFraction);
            const eased = 1 - Math.pow(1 - p, 3);
            z = d.peakZ + (normalCameraZ - d.peakZ) * eased;
            fov = d.peakFov + (BASE_FOV - d.peakFov) * eased;
        }
        camera.position.z = z;
        camera.fov = fov;
        camera.updateProjectionMatrix();
        updateScale();
        const intensity = Math.sin(Math.PI * progress);
        warp.visible = d.streak > 0;
        warpTravel += dt * (6 + intensity * 120);
        const wu = warp.material.uniforms;
        wu.uTravel.value = warpTravel;
        wu.uStretch.value = .4 + intensity * 3.2;
        wu.uAlpha.value = intensity * d.streak;
        if (d.warp) updateEarthPhotoTransition(progress, d.direction, d.swapFraction);
        if (progress >= 1) {
            const finished = d.targetMode;
            dollyState = null;
            settleCamera();
            window.mysticSetScene(finished);
        }
    }

    function settleCamera() {
        if (warp) {
            warp.visible = false;
            warp.material.uniforms.uAlpha.value = 0;
        }
        camera.position.z = normalCameraZ;
        camera.fov = BASE_FOV;
        camera.updateProjectionMatrix();
        updateScale();
        bgContainer.style.opacity = "";
        if (earthPhotoLayer) earthPhotoLayer.style.opacity = "";
        if (earthPhotoMain) earthPhotoMain.style.transform = "";
    }

    function frame(now) {
        const raw = Math.min(Math.max((now - lastNow) / 1e3, 0), .1);
        lastNow = now;
        if (!dollyState && (mode === "earth" || reducedMotion && !needsRender)) {
            looping = false;
            return;
        }
        requestAnimationFrame(frame);
        if (document.hidden) return;
        let dt = raw;
        if (!dollyState && deepScroll && !reducedMotion) {
            throttleAcc += raw;
            if (throttleAcc < 1 / 31) return;
            dt = throttleAcc;
            throttleAcc = 0;
        } else {
            throttleAcc = 0;
            govern(raw);
        }
        if (!reducedMotion) elapsed += dt;
        uTime.value = elapsed;
        if (dollyState) stepDolly(now, dt);
        if (starfield && starfield.visible) starfield.rotation.y = -elapsed * .006;
        if (galaxy && galaxy.group.visible) galaxy.update(elapsed);
        let shake = 0;
        if (universe && universe.group.visible) {
            universe.update(elapsed);
            shake = Math.pow(1 - universe.birthLevel(), 3) * .035;
        }
        if (!reducedMotion) {
            const follow = 1 - Math.exp(-dt * 1.1);
            camX += (Math.sin(elapsed * .05) * .6 + pointerX * .5 - camX) * follow;
            camY += (Math.cos(elapsed * .04) * .3 - pointerY * .35 - camY) * follow;
        }
        camera.position.x = camX + (shake ? (Math.random() - .5) * shake : 0);
        camera.position.y = camY + (shake ? (Math.random() - .5) * shake : 0);
        lookTarget.set(0, -camera.position.z * .1, 0);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
        needsRender = false;
    }

    const whenIdle = window.requestIdleCallback ? cb => window.requestIdleCallback(cb, { timeout: 2e3 }) : cb => setTimeout(cb, 500);

    function warmUp() {
        whenIdle(() => {
            ensureStarfield();
            ensureWarp();
            ensureGalaxy();
            whenIdle(() => ensureUniverse());
        });
    }

    if (document.readyState === "complete") warmUp(); else window.addEventListener("load", warmUp, { once: true });

    window.mysticSetScene(mode);
})();
