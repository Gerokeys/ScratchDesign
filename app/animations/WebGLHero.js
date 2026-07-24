import * as THREE from 'three';
import { gsap } from 'gsap';

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */`
precision highp float;
uniform float uTime;
uniform vec2  uMouse;
varying vec2  vUv;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 mouse = uMouse - 0.5;
  uv += mouse * 0.035;

  float t  = uTime * 0.07;
  vec2  p  = uv * 2.8;
  float f1 = fbm(p + t + vec2(1.7,  9.2));
  float f2 = fbm(p - t * 0.6 + vec2(8.3, 2.8));
  float n  = fbm(p + vec2(f1, f2) * 0.85 + t * 0.4);

  // Base dark background
  vec3 dark  = vec3(0.027, 0.027, 0.027);
  // Deep navy for depth
  vec3 deep  = vec3(0.018, 0.024, 0.046);
  // Ember orange accent
  vec3 ember = vec3(0.91, 0.447, 0.165);

  vec3 col = mix(dark, deep, smoothstep(0.28, 0.72, n) * 0.55);
  col += ember * pow(max(n - 0.45, 0.0), 2.2) * 0.18;
  col += ember * pow(fbm(uv * 9.0 - t * 0.9), 3.0) * 0.055;

  // Radial vignette — darker at edges
  float vig = smoothstep(1.6, 0.4, length(uv - 0.5) * 2.2);
  col *= vig * 0.45 + 0.55;

  // Film grain
  col += (hash(uv * 512.0 + fract(uTime)) - 0.5) * 0.018;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export default class WebGLHero {
  constructor() {
    this._canvas = document.getElementById('hero-canvas');
    if (!this._canvas) return;

    this._mouse  = new THREE.Vector2(0.5, 0.5);
    this._target = new THREE.Vector2(0.5, 0.5);
    this._raf    = null;

    this._init();
    this._events();
    this._tick();
  }

  _init() {
    this._renderer = new THREE.WebGLRenderer({
      canvas:    this._canvas,
      antialias: false,
      alpha:     false,
    });
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

    this._scene  = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this._camera.position.z = 1;

    this._uni = {
      uTime:  { value: 0 },
      uMouse: { value: this._mouse },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms:       this._uni,
      vertexShader:   VERT,
      fragmentShader: FRAG,
    });

    this._scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    this._resize();
  }

  _resize() {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _events() {
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('mousemove', (e) => {
      this._target.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
    });
  }

  _tick() {
    gsap.ticker.add((t) => {
      this._mouse.lerp(this._target, 0.045);
      this._uni.uTime.value = t;
      this._renderer.render(this._scene, this._camera);
    });
  }

  destroy() {
    this._renderer.dispose();
  }
}
