'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SpiceAtmosphereShaderProps {
  enabled: boolean;
  /** Primary warm atmospheric color [r,g,b] in 0..1 */
  colorA: [number, number, number];
  /** Secondary spice glow color [r,g,b] in 0..1 */
  colorB: [number, number, number];
  /** Deep shadow base color [r,g,b] in 0..1 */
  colorBase: [number, number, number];
  onStatusChange?: (status: 'active' | 'fallback' | 'context-lost') => void;
}

const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Lightweight organic Madurai spice-aroma & warm silk light-current GLSL shader (~2 KB, zero Three.js bloat!)
const FRAG_SRC = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec3 uColorBase;
uniform vec3 uColorA;
uniform vec3 uColorB;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  vec2 drift = vec2(uTime * 0.045, -uTime * 0.03);
  vec2 mousePull = (uPointer - 0.5) * 0.28;

  float q = fbm(p * 1.9 + drift + mousePull);
  float r = fbm(p * 2.6 + vec2(q * 1.35, -q * 1.1) - drift * 0.7);

  // Focal warm halo behind the right-center floating pouch stage
  vec2 stageCenter = vec2(0.24 * aspect, -0.02);
  float dStage = length(p - stageCenter);
  float stageHalo = exp(-dStage * dStage * 2.4);

  // Secondary gentle brass glow from top-left
  vec2 cornerCenter = vec2(-0.48 * aspect, 0.36);
  float cornerGlow = exp(-length(p - cornerCenter) * 2.1) * 0.45;

  vec3 col = uColorBase;
  col = mix(col, uColorA, smoothstep(0.22, 0.82, r) * (0.48 + stageHalo * 0.55));
  col = mix(col, uColorB, smoothstep(0.45, 0.92, q * 0.6 + stageHalo * 0.75) * 0.65);
  col += uColorB * cornerGlow * 0.35;

  // Fine analog tactile film grain to eliminate gradient banding
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.025;
  col += grain;

  // Soft outer vignette focusing attention on the floating Madurai pouch
  float vig = smoothstep(1.38, 0.35, length(p));
  col *= mix(0.68, 1.06, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Custom zero-dependency WebGL GLSL spice-atmosphere shader.
 * Smoothly interpolates palette uniforms when hero flavours switch,
 * caps DPR <= 1.25, pauses offscreen/hidden, and cleans up GL context cleanly.
 */
export default function SpiceAtmosphereShader({
  enabled,
  colorA,
  colorB,
  colorBase,
  onStatusChange,
}: SpiceAtmosphereShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetColorsRef = useRef({ colorA, colorB, colorBase });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    targetColorsRef.current = { colorA, colorB, colorBase };
  }, [colorA, colorB, colorBase]);

  useEffect(() => {
    if (!enabled || failed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onStatusChange?.('fallback');
      return;
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });

    if (!gl) {
      setFailed(true);
      onStatusChange?.('fallback');
      return;
    }

    const compile = (type: number, source: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) {
      setFailed(true);
      onStatusChange?.('fallback');
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setFailed(true);
      onStatusChange?.('fallback');
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setFailed(true);
      onStatusChange?.('fallback');
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uColorBase = gl.getUniformLocation(program, 'uColorBase');
    const uColorA = gl.getUniformLocation(program, 'uColorA');
    const uColorB = gl.getUniformLocation(program, 'uColorB');

    const curBase = [...targetColorsRef.current.colorBase];
    const curA = [...targetColorsRef.current.colorA];
    const curB = [...targetColorsRef.current.colorB];

    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetPX = 0.5;
    let targetPY = 0.5;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let rafId = 0;
    let lastDraw = 0;
    const startTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const h = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();

    const onPointerMove = (e: PointerEvent) => {
      targetPX = e.clientX / Math.max(window.innerWidth, 1);
      targetPY = 1.0 - e.clientY / Math.max(window.innerHeight, 1);
    };

    const onVisibility = () => {
      isTabVisible = !document.hidden;
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
      onStatusChange?.('context-lost');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.02 }
    );
    observer.observe(canvas);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);

    onStatusChange?.('active');

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (!isVisible || !isTabVisible) return;
      if (now - lastDraw < 33) return;
      lastDraw = now;

      const t = (now - startTime) * 0.001;
      pointerX += (targetPX - pointerX) * 0.04;
      pointerY += (targetPY - pointerY) * 0.04;

      const tgt = targetColorsRef.current;
      // Smooth ~1.35s cinematic atmospheric colour transition matching the hero scene choreography
      for (let i = 0; i < 3; i++) {
        curBase[i] = (curBase[i] ?? 0) + ((tgt.colorBase[i] ?? 0) - (curBase[i] ?? 0)) * 0.072;
        curA[i] = (curA[i] ?? 0) + ((tgt.colorA[i] ?? 0) - (curA[i] ?? 0)) * 0.072;
        curB[i] = (curB[i] ?? 0) + ((tgt.colorB[i] ?? 0) - (curB[i] ?? 0)) * 0.072;
      }

      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uPointer, pointerX, pointerY);
      gl.uniform3f(uColorBase, curBase[0]!, curBase[1]!, curBase[2]!);
      gl.uniform3f(uColorA, curA[0]!, curA[1]!, curA[2]!);
      gl.uniform3f(uColorB, curB[0]!, curB[1]!, curB[2]!);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [enabled, failed, onStatusChange]);

  if (!enabled || failed) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
