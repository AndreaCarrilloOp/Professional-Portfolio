import { useEffect, useRef } from "react";

const PALETTE_TRANSITION_MS = 340;

const LIGHT_PALETTE = {
  point: [31, 79, 122],
  line: [111, 132, 154],
  glow: [59, 113, 143],
  lineAlpha: 0.09,
  glowAlpha: 0.06,
  pointAlpha: 0.62,
};

const DARK_PALETTE = {
  point: [203, 231, 255],
  line: [145, 193, 230],
  glow: [126, 198, 216],
  lineAlpha: 0.14,
  glowAlpha: 0.1,
  pointAlpha: 0.78,
};

function createParticles(width, height, count, isSmallViewport) {
  const speed = isSmallViewport ? 0.09 : 0.14;

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    radius: Math.random() * 1.5 + 0.7,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.014 + 0.006,
  }));
}

function getParticleCount(width, height) {
  const area = width * height;
  const isSmallViewport = width <= 720;
  const density = isSmallViewport ? 36000 : 26000;
  const max = isSmallViewport ? 38 : 62;
  const min = isSmallViewport ? 18 : 26;

  return Math.max(min, Math.min(max, Math.round(area / density)));
}

function interpolateValue(from, to, progress) {
  return from + (to - from) * progress;
}

function interpolatePalette(from, to, progress) {
  const mixChannel = (fromColor, toColor) =>
    fromColor.map((channel, index) =>
      Math.round(interpolateValue(channel, toColor[index], progress)),
    );

  return {
    point: mixChannel(from.point, to.point),
    line: mixChannel(from.line, to.line),
    glow: mixChannel(from.glow, to.glow),
    lineAlpha: interpolateValue(from.lineAlpha, to.lineAlpha, progress),
    glowAlpha: interpolateValue(from.glowAlpha, to.glowAlpha, progress),
    pointAlpha: interpolateValue(from.pointAlpha, to.pointAlpha, progress),
  };
}

function getTargetPalette(darkMode) {
  return darkMode ? DARK_PALETTE : LIGHT_PALETTE;
}

export default function ConstellationBackground({ darkMode = true }) {
  const canvasRef = useRef(null);
  const currentPaletteRef = useRef(getTargetPalette(darkMode));
  const paletteTransitionRef = useRef(null);

  useEffect(() => {
    const targetPalette = getTargetPalette(darkMode);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      currentPaletteRef.current = targetPalette;
      paletteTransitionRef.current = null;
    } else {
      const now = performance.now();
      const activeTransition = paletteTransitionRef.current;
      let currentPalette = currentPaletteRef.current;

      if (activeTransition) {
        const progress = Math.min(
          1,
          (now - activeTransition.startedAt) / PALETTE_TRANSITION_MS,
        );
        currentPalette = interpolatePalette(
          activeTransition.from,
          activeTransition.to,
          progress,
        );
      }

      currentPaletteRef.current = currentPalette;
      paletteTransitionRef.current = {
        from: currentPalette,
        to: targetPalette,
        startedAt: now,
      };
    }

    window.dispatchEvent(new Event("portfolio-theme-palette-change"));
  }, [darkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    let isRunning = false;
    let prefersReducedMotion = reducedMotionQuery.matches;

    const resolvePalette = () => {
      const transition = paletteTransitionRef.current;
      if (!transition) return currentPaletteRef.current;

      const progress = Math.min(
        1,
        (performance.now() - transition.startedAt) / PALETTE_TRANSITION_MS,
      );
      const palette = interpolatePalette(
        transition.from,
        transition.to,
        progress,
      );

      if (progress >= 1) {
        currentPaletteRef.current = transition.to;
        paletteTransitionRef.current = null;
      }

      return palette;
    };

    const draw = () => {
      const palette = resolvePalette();
      const isSmallViewport = width <= 720;
      const connectionDistance = isSmallViewport
        ? Math.min(112, Math.max(72, width * 0.18))
        : Math.min(154, Math.max(96, width * 0.1));

      context.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        for (const particle of particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.twinkle += particle.twinkleSpeed;

          if (particle.x < -16) particle.x = width + 16;
          if (particle.x > width + 16) particle.x = -16;
          if (particle.y < -16) particle.y = height + 16;
          if (particle.y > height + 16) particle.y = -16;
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > connectionDistance) continue;

          const alpha =
            (1 - distance / connectionDistance) * palette.lineAlpha;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${alpha})`;
          context.lineWidth = 0.75;
          context.stroke();
        }
      }

      for (const particle of particles) {
        const pulse = prefersReducedMotion
          ? 0.78
          : 0.68 + Math.sin(particle.twinkle) * 0.18;
        const radius = particle.radius * pulse;
        const glowRadius = radius * (isSmallViewport ? 4.2 : 5.4);

        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowRadius,
        );
        gradient.addColorStop(
          0,
          `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, ${palette.glowAlpha})`,
        );
        gradient.addColorStop(1, "transparent");

        context.beginPath();
        context.fillStyle = gradient;
        context.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = `rgba(${palette.point[0]}, ${palette.point[1]}, ${palette.point[2]}, ${palette.pointAlpha})`;
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      if (isRunning && !prefersReducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isSmallViewport = nextWidth <= 720;

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = createParticles(
        width,
        height,
        getParticleCount(width, height),
        isSmallViewport,
      );

      if (prefersReducedMotion) draw();
    };

    const start = () => {
      if (isRunning) return;
      isRunning = true;
      draw();
    };

    const stop = () => {
      isRunning = false;
      window.cancelAnimationFrame(animationFrame);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }

      if (prefersReducedMotion) {
        draw();
        return;
      }

      start();
    };

    const handleReducedMotionChange = (event) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion) {
        stop();
        draw();
        return;
      }

      start();
    };

    const handlePaletteChange = () => {
      if (prefersReducedMotion) draw();
    };

    resize();
    if (prefersReducedMotion) draw();
    else start();

    window.addEventListener("resize", resize);
    window.addEventListener(
      "portfolio-theme-palette-change",
      handlePaletteChange,
    );
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "portfolio-theme-palette-change",
        handlePaletteChange,
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="constellation-canvas"
      aria-hidden="true"
    />
  );
}
