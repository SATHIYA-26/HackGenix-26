"use client";

import { useEffect, useRef } from "react";

export default function DovetailCursor() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let spotX = mouseX;
    let spotY = mouseY;
    let animId = null;

    let ctx = null;
    let particles = [];
    let dpr = window.devicePixelRatio || 1;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    const TOKEN_COINS = ["₿", "₹", "$", "€", "¥"];
    const TOKEN_METRICS = ["+24%", "98.2%", "4.9★", "0.95", "+16%", "99.4%", "14.8x", "+41.8%", "VoC", "AI"];
    const TOKEN_GLYPHS = ["✦", "▲", "§", "//", "✓", "•", "Ø", "#", "&", "⌘", "⌥", "⚡", "::", "→", "~", "<>", "+"];
    const THEME_COLORS = ["#7C3AED", "#4F46E5", "#059669", "#D97706", "#18181B", "#6366F1"];

    if (canvas && canvas.getContext) {
      ctx = canvas.getContext("2d");
      function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        dpr = window.devicePixelRatio || 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = canvasWidth + "px";
        canvas.style.height = canvasHeight + "px";
        if (ctx) ctx.scale(dpr, dpr);
      }
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
    }

    function spawnParticle(x, y, isBurst = false, customVy = null) {
      if (!ctx) return;
      if (particles.length > 70) return;

      const rand = Math.random();
      let type = "glyph";
      let text = "";
      let color = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];

      if (rand < 0.38) {
        type = "coin";
        text = TOKEN_COINS[Math.floor(Math.random() * TOKEN_COINS.length)];
        color = Math.random() > 0.4 ? "#D97706" : "#7C3AED";
      } else if (rand < 0.72) {
        type = "metric";
        text = TOKEN_METRICS[Math.floor(Math.random() * TOKEN_METRICS.length)];
        color = text.startsWith("+") || text.includes("★") ? "#059669" : "#7C3AED";
      } else {
        type = "glyph";
        text = TOKEN_GLYPHS[Math.floor(Math.random() * TOKEN_GLYPHS.length)];
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? 1.8 + Math.random() * 3.2 : 0.6 + Math.random() * 1.5;

      particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: customVy !== null ? customVy + (Math.random() - 0.5) * 1.5 : Math.sin(angle) * speed - (isBurst ? 1.0 : 0.4),
        type: type,
        text: text,
        color: color,
        size: type === "metric" ? 9 : (type === "coin" ? 11 : 10),
        alpha: 0.95,
        life: isBurst ? 55 + Math.random() * 25 : 45 + Math.random() * 25,
        maxLife: 65,
        rotation: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.04
      });
    }

    function updateAndDrawParticles() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.life--;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0 || p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.type === "coin") {
          const radius = p.size;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color === "#D97706" ? "rgba(254, 243, 199, 0.95)" : "rgba(245, 243, 255, 0.95)";
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = p.color;
          ctx.stroke();

          ctx.font = `700 ${Math.round(p.size * 1.1)}px 'Inter', sans-serif`;
          ctx.fillStyle = p.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, 0, 0.5);
        } else if (p.type === "metric") {
          ctx.font = `600 ${p.size}px 'Inter', sans-serif`;
          const textMetrics = ctx.measureText(p.text);
          const paddingX = 6;
          const pillWidth = textMetrics.width + paddingX * 2;
          const pillHeight = p.size + 6;

          ctx.beginPath();
          ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 9999);
          ctx.fillStyle = p.color === "#059669" ? "rgba(236, 253, 245, 0.92)" : "rgba(245, 243, 255, 0.92)";
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = p.color === "#059669" ? "rgba(5, 150, 105, 0.35)" : "rgba(124, 58, 237, 0.35)";
          ctx.stroke();

          ctx.fillStyle = p.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, 0, 0);
        } else {
          ctx.font = `700 ${p.size}px 'Inter', monospace`;
          ctx.fillStyle = p.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, 0, 0);
        }

        ctx.restore();
      }
    }

    let distAccumulator = 0;
    let lastScrollY = window.scrollY;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.body.classList.add("cursor-active");

      if (prevMouseX !== -100) {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        distAccumulator += dist;

        if (distAccumulator > 26) {
          spawnParticle(mouseX, mouseY, false);
          distAccumulator = 0;
        }
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(deltaY) > 2) {
        const spawnX = mouseX > 0 && mouseX < window.innerWidth ? mouseX + (Math.random() - 0.5) * 120 : Math.random() * window.innerWidth;
        const spawnY = mouseY > 0 && mouseY < window.innerHeight ? mouseY + (Math.random() - 0.5) * 80 : Math.random() * window.innerHeight;
        const scrollVelocity = deltaY > 0 ? -1.2 : 1.2;

        spawnParticle(spawnX, spawnY, false, scrollVelocity);
      }
    };

    const handleMouseLeave = () => {
      document.body.classList.remove("cursor-active");
    };

    const handleMouseEnter = () => {
      document.body.classList.add("cursor-active");
    };

    const handleMouseDown = (e) => {
      for (let i = 0; i < 7; i++) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);

    function renderCursor() {
      spotX += (mouseX - spotX) * 0.08;
      spotY += (mouseY - spotY) * 0.08;

      if (spotlight) {
        spotlight.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;
      }

      updateAndDrawParticles();
      animId = requestAnimationFrame(renderCursor);
    }

    animId = requestAnimationFrame(renderCursor);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <>
      <canvas
        id="cursorParticleCanvas"
        ref={canvasRef}
        className="dovetail-particle-canvas"
        aria-hidden="true"
      />
      <div
        id="cursorSpotlight"
        ref={spotlightRef}
        className="dovetail-cursor-spotlight"
        aria-hidden="true"
      />
    </>
  );
}
