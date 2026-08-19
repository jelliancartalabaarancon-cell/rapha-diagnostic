"use client";

import { useEffect, useRef } from "react";

/*
 * Decorative animated DNA helix for the hero section.
 *
 * How the speed control works:
 * - IDLE_SPEED is how fast it spins with no user input — a slow,
 *   ambient rotation.
 * - Every scroll event adds a small "boost" proportional to how far
 *   the page moved.
 * - The boost decays every frame (multiplied by SCROLL_DECAY), so it
 *   naturally settles back to idle speed shortly after you stop
 *   scrolling — no permanent speed-up.
 * - MAX_SPEED is a hard ceiling on top of idle + boost combined. No
 *   matter how fast or violently the user scrolls, the rotation speed
 *   can never exceed this, which is what keeps it from ever looking
 *   like it's "spinning out" or glitching.
 *
 * Drawn on <canvas> instead of animated SVG/CSS because the rotation
 * angle changes every frame — driving that through React state would
 * mean a re-render 60 times a second. Canvas lets the animation loop
 * mutate pixels directly, which is what keeps this smooth.
 */

const IDLE_SPEED = 0.012; // radians per frame at rest
const MAX_SPEED = 0.09; // hard cap — total speed can never exceed this
const SCROLL_DECAY = 0.94; // how quickly the scroll boost fades per frame
const SCROLL_BOOST_FACTOR = 0.0025; // how much each pixel of scroll adds to speed

const RUNG_COUNT = 14;
const HELIX_RADIUS = 46;
const HELIX_HEIGHT = 360;

export function DnaHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    let phase = 0;
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    let rafId = 0;
    let running = true;

    function handleScroll() {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Add an impulse, but the MAX_SPEED clamp in the draw loop is
      // the real safety net — this cap just avoids one huge scroll
      // jump piling on an absurd boost value.
      scrollBoost = Math.min(scrollBoost + delta * SCROLL_BOOST_FACTOR, MAX_SPEED);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    function handleVisibility() {
      running = document.visibilityState === "visible";
      if (running) rafId = requestAnimationFrame(draw);
    }

    document.addEventListener("visibilitychange", handleVisibility);

    const centerX = () => width / 2;

    function draw() {
      if (!running) return;

      ctx!.clearRect(0, 0, width, height);

      // Hard speed cap: no matter how large scrollBoost gets, total
      // speed this frame cannot exceed MAX_SPEED.
      const speed = Math.min(IDLE_SPEED + scrollBoost, MAX_SPEED);
      phase += speed;
      scrollBoost *= SCROLL_DECAY;

      const cx = centerX();
      const top = (height - HELIX_HEIGHT) / 2;
      const step = HELIX_HEIGHT / RUNG_COUNT;

      type Point = { x: number; y: number; z: number };
      const strandA: Point[] = [];
      const strandB: Point[] = [];

      for (let i = 0; i <= RUNG_COUNT; i++) {
        const y = top + i * step;
        const angle = phase + i * 0.5;
        strandA.push({
          x: cx + Math.sin(angle) * HELIX_RADIUS,
          y,
          z: Math.cos(angle),
        });
        strandB.push({
          x: cx + Math.sin(angle + Math.PI) * HELIX_RADIUS,
          y,
          z: Math.cos(angle + Math.PI),
        });
      }

      // Rungs first, so strand dots draw on top of them.
      for (let i = 0; i <= RUNG_COUNT; i++) {
        const a = strandA[i];
        const b = strandB[i];
        const depth = (a.z + 1) / 2; // 0 (back) → 1 (front)

        ctx!.strokeStyle = `rgba(220, 111, 31, ${0.12 + depth * 0.22})`;
        ctx!.lineWidth = 1 + depth * 0.5;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      const drawStrand = (points: Point[], colorRgb: string) => {
        // Connect the strand itself with a thin curve.
        ctx!.strokeStyle = `rgba(${colorRgb}, 0.35)`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx!.moveTo(p.x, p.y);
          else ctx!.lineTo(p.x, p.y);
        });
        ctx!.stroke();

        // Nucleotide dots, sized/opacity by depth for a pseudo-3D feel.
        points.forEach((p) => {
          const depth = (p.z + 1) / 2;
          const radius = 3 + depth * 3;
          ctx!.fillStyle = `rgba(${colorRgb}, ${0.35 + depth * 0.65})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx!.fill();
        });
      };

      drawStrand(strandA, "29, 111, 165"); // clinical-600
      drawStrand(strandB, "47, 127, 46"); // vital-600

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-[420px] w-full max-w-md"
      aria-hidden="true"
    />
  );
}
