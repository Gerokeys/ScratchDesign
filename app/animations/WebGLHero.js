import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * WebGLHero — slow-drifting topographic contour lines.
 *
 * Renders iso-contours of a domain-warped fbm noise field on a fullscreen quad.
 * The field drifts gently and bulges *subtly* around the pointer.
 *
 * Instantiate once per canvas (hero, approach, …) — pointer state is shared at
 * module level so the deformation reads as one continuous field across them.
 */

// ── shared pointer state (page coords, updated once for all instances) ────────
const pointer = { x: 0, y: 0, active: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = 1;
  }, { passive: true });

  document.addEventListener('pointerleave', () => { pointer.active = 0; });
}

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
uniform vec2  uMouse;      // aspect-corrected, same space as p
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
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  float t = uTime * 0.014;   // slow, ambient drift

  // ── pointer deformation (deliberately gentle) ──────────────────────────────
  // Scaling by toM rather than its normalised form keeps displacement at zero
  // on the cursor itself, so the field bulges instead of spiking to a point.
  vec2  toM  = p - uMouse;
  float dM   = length(toM);
  float infl = exp(-dM * dM * 2.6) * uMouseAmt;
  p += toM * infl * 0.22;

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
  float f    = field * uCount * (1.0 + infl * 0.12);
  float w    = fwidth(f);
  float e    = abs(fract(f - 0.5) - 0.5);
  float mask = 1.0 - smoothstep(0.0, w * 1.35, e);

  mask *= smoothstep(1.6, 0.45, w);   // avoid moire where lines crowd

  // ── shading ────────────────────────────────────────────────────────────────
  float sheen = smoothstep(0.30, 0.85, fbm(p * 0.7 - t * 0.5));
  vec3  lineCol = mix(uLine, uLine * 2.1, sheen);

  // faint accent warmth right around the pointer
  lineCol = mix(lineCol, uAccent, clamp(infl * 0.35, 0.0, 0.28));

  float intensity = 0.72 + sheen * 0.5 + infl * 0.18;

  vec3 col = mix(uBg, lineCol, clamp(mask * intensity, 0.0, 1.0));

  float vig = smoothstep(1.75, 0.3, length(p));
  col *= 0.9 + vig * 0.1;

  col += (hash(uv * 900.0 + fract(uTime)) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}`;

export default class WebGLHero {
  /** @param {string|HTMLCanvasElement} target canvas id or element */
  constructor(target = 'hero-canvas') {
    this._canvas = typeof target === 'string'
      ? document.getElementById(target)
      : target;
    if (!this._canvas) return;

    this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._visible = true;
    this._mouse   = new THREE.Vector2(0, 0);
    this._amt     = 0;

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
      uLine:     { value: pick('--h-line',  '#454545') },
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
    const r = this._canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    this._renderer.setSize(w, h, false);
    this._uni.uRes.value.set(w, h);
    this._uni.uCount.value = window.innerWidth < 768 ? 13.0 : 18.0;
  }

  _events() {
    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);
  }

  _observe() {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(
      ([entry]) => { this._visible = entry.isIntersecting; },
      { threshold: 0 }
    ).observe(this._canvas);
  }

  _loop(time) {
    if (!this._visible) return;

    // Convert the shared page-space pointer into this canvas's local field space
    const r = this._canvas.getBoundingClientRect();
    if (r.width && r.height) {
      const aspect = r.width / r.height;
      const tx = ((pointer.x - r.left) / r.width  - 0.5) * aspect;
      const ty = -((pointer.y - r.top) / r.height - 0.5);
      this._mouse.x += (tx - this._mouse.x) * 0.07;
      this._mouse.y += (ty - this._mouse.y) * 0.07;
    }

    this._amt += (pointer.active - this._amt) * 0.05;
    this._uni.uMouseAmt.value = this._amt;

    if (!this._reduced) this._uni.uTime.value = time;

    this._renderer.render(this._scene, this._camera);
  }

  destroy() {
    gsap.ticker.remove(this._loop);
    window.removeEventListener('resize', this._onResize);
    this._renderer?.dispose();
  }
}
