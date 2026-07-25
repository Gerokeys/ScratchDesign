import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * WebGLHero — flowing topographic contour lines.
 *
 * A fullscreen GLSL quad renders iso-contours of a domain-warped fbm noise
 * field. The field drifts continuously (time) and is deformed around the
 * pointer: lines bend away from the cursor and brighten near it.
 */

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const FRAG = /* glsl */`
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;
uniform vec2  uMouse;      // normalised, aspect-corrected
uniform float uMouseAmt;   // 0..1 pointer presence
uniform vec3  uBg;
uniform vec3  uLine;
uniform vec3  uAccent;
uniform float uCount;      // contour density

// ── value noise ──────────────────────────────────────────────────────────────
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  // aspect-corrected coords
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  float t = uTime * 0.045;

  // ── pointer deformation ───────────────────────────────────────────────────
  // Scaling by toM (not its normalised form) keeps the displacement zero at the
  // cursor itself, so the field bulges smoothly instead of spiking to a point.
  vec2  toM  = p - uMouse;
  float dM   = length(toM);
  float infl = exp(-dM * dM * 2.2) * uMouseAmt;
  p += toM * infl * 0.85;

  // ── domain-warped fbm → organic flowing topography ─────────────────────────
  vec2 q = vec2(
    fbm(p * 1.15 + vec2(0.0, t)),
    fbm(p * 1.15 + vec2(5.2, 1.3) - t * 0.8)
  );
  vec2 r = vec2(
    fbm(p * 1.6 + 2.4 * q + vec2(1.7, 9.2) + t * 1.1),
    fbm(p * 1.6 + 2.4 * q + vec2(8.3, 2.8) - t * 0.9)
  );
  float field = fbm(p * 1.35 + 2.6 * r + t * 0.4);

  // ── iso-contours ───────────────────────────────────────────────────────────
  float dens = uCount * (1.0 + infl * 0.45);  // slightly denser near the cursor
  float f    = field * dens;
  float w    = fwidth(f);
  float e    = abs(fract(f - 0.5) - 0.5);    // distance to nearest contour
  float mask = 1.0 - smoothstep(0.0, w * 1.35, e);

  // fade lines that get too dense to resolve (avoids moire)
  mask *= smoothstep(1.6, 0.45, w);

  // ── shading ────────────────────────────────────────────────────────────────
  // broad variation so some regions read brighter, like a lit topo map
  float sheen = smoothstep(0.30, 0.85, fbm(p * 0.7 - t * 0.5));
  vec3  lineCol = mix(uLine, uLine * 2.1, sheen);

  // accent tint blooming around the pointer
  lineCol = mix(lineCol, uAccent, clamp(infl * 0.85, 0.0, 0.55));

  float intensity = 0.72 + sheen * 0.5 + infl * 0.45;

  vec3 col = mix(uBg, lineCol, clamp(mask * intensity, 0.0, 1.0));

  // gentle vignette — keep the field readable edge to edge
  float vig = smoothstep(1.75, 0.3, length(p));
  col *= 0.9 + vig * 0.1;

  // grain
  col += (hash(uv * 900.0 + fract(uTime)) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}`;

export default class WebGLHero {
  constructor() {
    this._canvas = document.getElementById('hero-canvas');
    if (!this._canvas) return;

    this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._visible = true;

    this._mouse     = new THREE.Vector2(0, 0);
    this._mouseTgt  = new THREE.Vector2(0, 0);
    this._amt       = 0;
    this._amtTgt    = 0;

    this._init();
    this._events();
    this._observe();

    this._loop = this._loop.bind(this);
    gsap.ticker.add(this._loop);
  }

  _init() {
    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

    this._scene  = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const css = getComputedStyle(document.documentElement);
    // NOTE: a raw ShaderMaterial gets no automatic linear→sRGB output conversion,
    // so parse these as *already* display-space to avoid a double-dark result.
    const pick = (name, fallback) =>
      new THREE.Color().setStyle(
        (css.getPropertyValue(name) || fallback).trim(),
        THREE.LinearSRGBColorSpace,
      );

    this._uni = {
      uTime:     { value: 0 },
      uRes:      { value: new THREE.Vector2(1, 1) },
      uMouse:    { value: this._mouse },
      uMouseAmt: { value: 0 },
      uBg:       { value: pick('--h-bg',    '#1c1c1c') },
      uLine:     { value: pick('--h-line',  '#3a3a3a') },
      uAccent:   { value: pick('--h-green', '#6e9c7d') },
      uCount:    { value: window.innerWidth < 768 ? 13.0 : 18.0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms:       this._uni,
      vertexShader:   VERT,
      fragmentShader: FRAG,
      depthTest:      false,
      depthWrite:     false,
    });

    this._scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    this._resize();
  }

  _resize() {
    const w = window.innerWidth;
    const h = this._canvas.clientHeight || window.innerHeight;
    this._renderer.setSize(w, h, false);
    this._uni.uRes.value.set(w, h);
    this._uni.uCount.value = w < 768 ? 13.0 : 18.0;
  }

  _events() {
    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);

    this._onMove = (e) => {
      const r = this._canvas.getBoundingClientRect();
      const aspect = r.width / r.height;
      this._mouseTgt.set(
        ((e.clientX - r.left) / r.width  - 0.5) * aspect,
         -((e.clientY - r.top) / r.height - 0.5)
      );
      this._amtTgt = 1;
    };
    window.addEventListener('pointermove', this._onMove, { passive: true });

    this._onLeave = () => { this._amtTgt = 0; };
    document.addEventListener('pointerleave', this._onLeave);
  }

  _observe() {
    const hero = document.querySelector('.s-hero');
    if (!hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(
      ([entry]) => { this._visible = entry.isIntersecting; },
      { threshold: 0 }
    ).observe(hero);
  }

  _loop(time) {
    if (!this._visible) return;

    this._mouse.lerp(this._mouseTgt, 0.075);
    this._amt += (this._amtTgt - this._amt) * 0.06;

    this._uni.uMouseAmt.value = this._amt;
    if (!this._reduced) this._uni.uTime.value = time;

    this._renderer.render(this._scene, this._camera);
  }

  destroy() {
    gsap.ticker.remove(this._loop);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onMove);
    document.removeEventListener('pointerleave', this._onLeave);
    this._renderer?.dispose();
  }
}
