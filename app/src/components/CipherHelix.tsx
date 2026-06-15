import { useEffect, useRef } from "react";

export default function CipherHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const WAVE_AMPLITUDE = 60;
    const WAVE_FREQUENCY = 0.02;
    const FONT_SIZE = 14;
    const COLUMNS = 80;

    interface Particle {
      x: number;
      y: number;
      char: string;
      speed: number;
      alpha: number;
    }

    interface ColumnData {
      particles: Particle[];
      spawnTimer: number;
    }

    const columns: ColumnData[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize columns
    for (let i = 0; i < COLUMNS; i++) {
      columns.push({ particles: [], spawnTimer: 0 });
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);

      // Clear with dark background
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.008;
      const centerX = canvas.width / 2;

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let col = 0; col < COLUMNS; col++) {
        const x = (col / COLUMNS) * canvas.width;
        const wavePhase = (col * WAVE_FREQUENCY) + time;
        const waveOffset = Math.sin(wavePhase) * WAVE_AMPLITUDE;
        const colX = centerX + waveOffset + (x - centerX) * 0.3;

        // Spawn new particles
        columns[col].spawnTimer++;
        if (columns[col].spawnTimer > 2) {
          columns[col].spawnTimer = 0;
          columns[col].particles.push({
            x: colX,
            y: -20,
            char: chars[Math.floor(Math.random() * chars.length)],
            speed: 1.5 + Math.random() * 1.5,
            alpha: 1,
          });
        }

        // Update and draw particles
        const colParticles = columns[col].particles;
        for (let i = colParticles.length - 1; i >= 0; i--) {
          const p = colParticles[i];
          p.y += p.speed;

          // Fade near bottom
          if (p.y > canvas.height - 100) {
            p.alpha -= 0.02;
          }

          if (p.alpha <= 0 || p.y > canvas.height + 20) {
            colParticles.splice(i, 1);
            continue;
          }

          // Draw gradient line behind
          const intensity = Math.abs(Math.sin(wavePhase));
          const blue = 160 + Math.floor(intensity * 60);
          const gradientY = Math.cos(wavePhase) * 40;

          const grad = ctx.createLinearGradient(0, p.y - 20, 0, p.y + gradientY);
          grad.addColorStop(0, `rgba(60, 100, ${blue}, ${p.alpha * 0.3})`);
          grad.addColorStop(1, `rgba(20, 40, 70, 0)`);

          ctx.fillStyle = grad;
          ctx.fillRect(colX - 1, p.y - 30, 2, 60);

          // Draw character
          ctx.fillStyle = `rgba(180, 200, 255, ${p.alpha * 0.8})`;
          ctx.fillText(p.char, colX - FONT_SIZE / 2, p.y);
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
