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

  /* ——— Libra: 5-point star meshes ——— */
  const starGeo = createStarGeometry(isMobile ? 0.28 : 0.34, isMobile ? 0.11 : 0.14);
  /** @type {THREE.Mesh[]} */
  const starMeshes = [];
  const worldPositions = [];

  for (let i = 0; i < starCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf3e6c8,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(starGeo, mat);
    mesh.renderOrder = 2;
    libraLayer.add(mesh);
    starMeshes.push(mesh);
    worldPositions.push(new THREE.Vector3());
  }

  const linePositions = new Float32Array(LIBRA_LINES.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xe8c98a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const libraLines = new THREE.LineSegments(lineGeo, lineMat);
  libraLines.renderOrder = 1;
  libraLayer.add(libraLines);

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
      worldPositions[i].copy(pts[i]);
    }
    for (let i = 0; i < LIBRA_LINES.length; i++) {
      const [a, b] = LIBRA_LINES[i];
      const pa = pts[a];
      const pb = pts[b];
      const o = i * 6;
      linePositions[o] = pa.x;
      linePositions[o + 1] = pa.y;
      linePositions[o + 2] = pa.z;
      linePositions[o + 3] = pb.x;
      linePositions[o + 4] = pb.y;
      linePositions[o + 5] = pb.z;
    }
    lineGeo.getAttribute("position").needsUpdate = true;
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
      const mat = starMeshes[i].material;
      if (i < litUpTo) {
        mat.opacity = i === focusIdx ? 1 : 0.78;
        mat.color.setHex(i === focusIdx ? 0xfff6e0 : 0xf3e6c8);
      } else {
        mat.opacity = 0.28;
        mat.color.setHex(0xf3e6c8);
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

  /** Connect Libra points only — no movement */
  async function revealConstellation({ lineDuration = 1200 } = {}) {
    lockCamera = true;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(lookAt);
    applyLibraPositions();

    for (let i = 0; i < starCount; i++) {
      starMeshes[i].material.opacity = 1;
      starMeshes[i].material.color.setHex(0xfff6e0);
    }

    await fadeValue(
      () => lineMat.opacity,
      (v) => {
        lineMat.opacity = v;
      },
      1,
      lineDuration
    );
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
      fadeValue(
        () => lineMat.opacity,
        (v) => {
          lineMat.opacity = v;
        },
        0,
        600
      ),
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
    starGeo.dispose();
    starMeshes.forEach((m) => m.material.dispose());
    lineGeo.dispose();
    lineMat.dispose();
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
