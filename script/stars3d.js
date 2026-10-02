import * as THREE from "three";
import { LIBRA_POINTS as LIBRA_DESIGN, LIBRA_LINES } from "./libra.js";

function createStarGeometry(outerR = 0.42, innerR = 0.17, points = 5) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/**
 * WebGL sky — Libra as 5-point stars (Three.js only).
 */
export function createStarSky({ canvas }) {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxDpr = isMobile ? 1.15 : 1.75;
  const bgCount = isMobile ? 420 : 1200;
  const twinkle = !reduceMotion;
  const starCount = LIBRA_DESIGN.length;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: isMobile ? "low-power" : "high-performance",
    stencil: false,
    depth: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 28);

  const bgRoot = new THREE.Group();
  const libraLayer = new THREE.Group();
  scene.add(bgRoot);
  scene.add(libraLayer);

  /* ——— Soft particle field (behind constellation) ——— */
  const bgGeo = new THREE.BufferGeometry();
  const bgPos = new Float32Array(bgCount * 3);
  const bgSize = new Float32Array(bgCount);
  const bgPhase = new Float32Array(bgCount);

  for (let i = 0; i < bgCount; i++) {
    const r = 18 + Math.random() * 42;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1) * 0.72;
    bgPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    bgPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
    bgPos[i * 3 + 2] = r * Math.cos(phi) - 8;
    bgSize[i] = isMobile ? 0.7 + Math.random() * 1.3 : 0.9 + Math.random() * 1.8;
    bgPhase[i] = Math.random() * Math.PI * 2;
  }

  bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
  bgGeo.setAttribute("aSize", new THREE.BufferAttribute(bgSize, 1));
  bgGeo.setAttribute("aPhase", new THREE.BufferAttribute(bgPhase, 1));

  const bgMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uTwinkle: { value: twinkle ? 1 : 0 },
      uFade: { value: 0.55 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uTwinkle;
      varying float vAlpha;
      void main() {
        float tw = mix(0.75, 0.45 + 0.55 * sin(uTime * 1.1 + aPhase), uTwinkle);
        vAlpha = tw;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (180.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFade;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.08, d);
        gl_FragColor = vec4(0.95, 0.90, 0.78, soft * vAlpha * 0.7 * uFade);
      }
    `,
  });

  bgRoot.add(new THREE.Points(bgGeo, bgMat));

  const REASON_Z = 0;

  function getSafeBounds() {
    const dist = Math.max(0.1, camera.position.z - REASON_Z);
    const vFov = (camera.fov * Math.PI) / 180;
    const fullH = 2 * Math.tan(vFov / 2) * dist;
    const fullW = fullH * camera.aspect;
    return {
      minX: -fullW * 0.38,
      maxX: fullW * 0.38,
      minY: -fullH * 0.26,
      maxY: fullH * 0.32,
    };
  }

  function designToWorld(designPts, bounds) {
    return designPts.map(([x, y]) => {
      const nx = x / 1000;
      const ny = y / 420;
      return new THREE.Vector3(
        bounds.minX + nx * (bounds.maxX - bounds.minX),
        bounds.maxY - ny * (bounds.maxY - bounds.minY),
        REASON_Z
      );
    });
  }

  /* ——— Libra: alternate 5-point icons and round dots ——— */
  const starIconGeo = createStarGeometry(isMobile ? 0.72 : 0.9, isMobile ? 0.3 : 0.37);
  const starDotGeo = new THREE.CircleGeometry(isMobile ? 0.34 : 0.42, 28);
  const starGlowGeo = new THREE.CircleGeometry(1, 24);
  /** @type {THREE.Mesh[]} */
  const starMeshes = [];
  /** @type {THREE.Mesh[]} */
  const starGlows = [];
  const worldPositions = [];

  for (let i = 0; i < starCount; i++) {
    const isIcon = i % 2 === 0;
    const glow = new THREE.Mesh(
      starGlowGeo,
      new THREE.MeshBasicMaterial({
        color: 0xffe7b0,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.setScalar(isIcon ? (isMobile ? 1.15 : 1.4) : isMobile ? 0.85 : 1.05);
    glow.renderOrder = 3;

    const mesh = new THREE.Mesh(
      isIcon ? starIconGeo : starDotGeo,
      new THREE.MeshBasicMaterial({
        color: 0xfff6e0,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    mesh.renderOrder = 4;
    libraLayer.add(glow);
    libraLayer.add(mesh);
    starGlows.push(glow);
    starMeshes.push(mesh);
    worldPositions.push(new THREE.Vector3());
  }

  function setStarEmphasis(index, opacity, color) {
    const mesh = starMeshes[index];
    const glow = starGlows[index];
    mesh.material.opacity = opacity;
    mesh.material.color.setHex(color);
    glow.material.opacity = opacity > 0.7 ? 0.55 : 0.22;
    glow.material.color.setHex(color);
  }

  const ribbonGeo = new THREE.PlaneGeometry(1, 1);
  const lineThickness = isMobile ? 0.1 : 0.13;
  /** @type {{ a: THREE.Vector3, b: THREE.Vector3, progress: number, core: THREE.Mesh, glow: THREE.Mesh }[]} */
  const lineSegs = LIBRA_LINES.map(() => {
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xe8c98a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfff6e0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(ribbonGeo, glowMat);
    const core = new THREE.Mesh(ribbonGeo, coreMat);
    glow.renderOrder = 1;
    core.renderOrder = 2;
    libraLayer.add(glow);
    libraLayer.add(core);
    return {
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      progress: 0,
      core,
      glow,
    };
  });

  function layoutSegment(seg) {
    const t = Math.max(0, Math.min(1, seg.progress));
    const ex = seg.a.x + (seg.b.x - seg.a.x) * t;
    const ey = seg.a.y + (seg.b.y - seg.a.y) * t;
    const ez = seg.a.z + (seg.b.z - seg.a.z) * t;
    const len = Math.hypot(ex - seg.a.x, ey - seg.a.y);
    const show = t > 0.015 && len > 0.001;
    const ang = Math.atan2(ey - seg.a.y, ex - seg.a.x);
    const mx = (seg.a.x + ex) / 2;
    const my = (seg.a.y + ey) / 2;
    const mz = (seg.a.z + ez) / 2;

    seg.core.position.set(mx, my, mz);
    seg.glow.position.set(mx, my, mz);
    seg.core.rotation.z = ang;
    seg.glow.rotation.z = ang;
    seg.core.scale.set(Math.max(len, 0.0001), lineThickness, 1);
    seg.glow.scale.set(Math.max(len, 0.0001), lineThickness * 3.4, 1);
    seg.core.material.opacity = show ? 0.98 : 0;
    seg.glow.material.opacity = show ? 0.42 : 0;
  }

  let running = true;
  let visible = document.visibilityState === "visible";
  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let lockCamera = false;
  const clock = new THREE.Clock();
  const proj = new THREE.Vector3();
  const lookAt = new THREE.Vector3(0, 0, 0);

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function applyLibraPositions() {
    const bounds = getSafeBounds();
    const pts = designToWorld(LIBRA_DESIGN, bounds);
    for (let i = 0; i < starCount; i++) {
      starMeshes[i].position.copy(pts[i]);
      starGlows[i].position.copy(pts[i]);
      worldPositions[i].copy(pts[i]);
    }
    for (let i = 0; i < LIBRA_LINES.length; i++) {
      const [a, b] = LIBRA_LINES[i];
      lineSegs[i].a.copy(pts[a]);
      lineSegs[i].b.copy(pts[b]);
      layoutSegment(lineSegs[i]);
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    bgMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    applyLibraPositions();
  }

  function lightStar(reasonIndex) {
    const litUpTo = Math.min(reasonIndex + 1, starCount);
    const focusIdx = Math.min(reasonIndex, starCount - 1);
    for (let i = 0; i < starCount; i++) {
      if (i < litUpTo) {
        setStarEmphasis(i, i === focusIdx ? 1 : 0.82, i === focusIdx ? 0xfff8e8 : 0xf6ead0);
      } else {
        setStarEmphasis(i, 0.42, 0xf3e6c8);
      }
    }
  }

  function getStarScreenPos(reasonIndex) {
    const idx = Math.min(Math.max(0, reasonIndex), starCount - 1);
    proj.copy(worldPositions[idx]);
    libraLayer.localToWorld(proj);
    proj.project(camera);
    return {
      x: (proj.x * 0.5 + 0.5) * window.innerWidth,
      y: (-proj.y * 0.5 + 0.5) * window.innerHeight,
    };
  }

  function fadeValue(get, set, to, duration) {
    return new Promise((resolve) => {
      const start = get();
      const t0 = performance.now();
      const dur = reduceMotion ? 120 : duration;
      function step(now) {
        const t = Math.min(1, (now - t0) / dur);
        set(start + (to - start) * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  /** Draw each Libra segment from point A to point B */
  async function revealConstellation({ lineDuration = 2400 } = {}) {
    lockCamera = true;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(lookAt);

    for (let i = 0; i < starCount; i++) {
      setStarEmphasis(i, 0.62, 0xf6ead0);
    }
    lineSegs.forEach((seg) => {
      seg.progress = 0;
    });
    applyLibraPositions();

    const perLine = reduceMotion ? 40 : Math.max(260, lineDuration / lineSegs.length);

    for (let i = 0; i < lineSegs.length; i++) {
      const seg = lineSegs[i];
      const [ia, ib] = LIBRA_LINES[i];
      setStarEmphasis(ia, 1, 0xfff8e8);

      await new Promise((resolve) => {
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / perLine);
          seg.progress = easeInOutCubic(t);
          layoutSegment(seg);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });

      setStarEmphasis(ib, 1, 0xfff8e8);
    }
  }

  function onPointerMove(e) {
    if (isMobile || reduceMotion || !visible || lockCamera) return;
    targetX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.05;
    targetY = -((e.clientY / window.innerHeight) * 2 - 1) * 0.035;
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!running || !visible) return;

    const dt = Math.min(0.05, clock.getDelta());
    bgMat.uniforms.uTime.value = clock.elapsedTime;

    if (!reduceMotion && !lockCamera) {
      bgRoot.rotation.y += dt * (isMobile ? 0.008 : 0.014);
    }

    if (!isMobile && !reduceMotion && !lockCamera) {
      camera.position.x += (targetX * 1.4 - camera.position.x) * 0.05;
      camera.position.y += (targetY * 1.0 - camera.position.y) * 0.05;
      camera.lookAt(lookAt);
    }

    renderer.render(scene, camera);
  }

  /** Soften Libra before switching to finale name canvas */
  async function fadeLibraForName() {
    await Promise.all([
      ...lineSegs.flatMap((seg) => [
        fadeValue(
          () => seg.core.material.opacity,
          (v) => {
            seg.core.material.opacity = v;
          },
          0,
          600
        ),
        fadeValue(
          () => seg.glow.material.opacity,
          (v) => {
            seg.glow.material.opacity = v;
          },
          0,
          600
        ),
      ]),
      ...starMeshes.map((m) =>
        fadeValue(
          () => m.material.opacity,
          (v) => {
            m.material.opacity = v;
          },
          0,
          600
        )
      ),
      ...starGlows.map((m) =>
        fadeValue(
          () => m.material.opacity,
          (v) => {
            m.material.opacity = v;
          },
          0,
          600
        )
      ),
      fadeValue(
        () => bgMat.uniforms.uFade.value,
        (v) => {
          bgMat.uniforms.uFade.value = v;
        },
        0.25,
        600
      ),
    ]);
    libraLayer.visible = false;
  }

  function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibility);
    bgGeo.dispose();
    bgMat.dispose();
    starIconGeo.dispose();
    starDotGeo.dispose();
    starGlowGeo.dispose();
    starMeshes.forEach((m) => m.material.dispose());
    starGlows.forEach((m) => m.material.dispose());
    ribbonGeo.dispose();
    lineSegs.forEach((seg) => {
      seg.core.material.dispose();
      seg.glow.material.dispose();
    });
    renderer.dispose();
  }

  function onVisibility() {
    visible = document.visibilityState === "visible";
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  tick();

  return {
    isMobile,
    lightStar,
    getStarScreenPos,
    revealConstellation,
    fadeLibraForName,
    setVisible: (v) => {
      visible = v;
    },
    resize,
    dispose,
  };
}
