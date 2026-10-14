export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let rafId = null;
  let running = true;
  const points = Array.from({ length: 42 }, (_, index) => ({
    phase: Math.random() * Math.PI * 2,
    speed: 0.2 + Math.random() * 0.5,
    x: (index / 41)
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height || 280);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0, 189, 235, 0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();

    points.forEach((point, idx) => {
      const x = point.x * width;
      const yBase = height * 0.56;
      const y = yBase + Math.sin(time * 0.001 * point.speed + point.phase) * (reduceMotion ? 3 : 18);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = 'rgba(7, 141, 235, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, idx) => {
      const x = point.x * width;
      const yBase = height * 0.34;
      const y = yBase + Math.cos(time * 0.0012 * point.speed + point.phase) * (reduceMotion ? 2 : 11);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (!reduceMotion) rafId = requestAnimationFrame(draw);
  };

  const onVisibility = () => {
    running = !document.hidden;
    if (running && !rafId && !reduceMotion) rafId = requestAnimationFrame(draw);
    if (!running && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  resize();
  draw(0);
  if (!reduceMotion) rafId = requestAnimationFrame(draw);

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas);
  document.addEventListener('visibilitychange', onVisibility);

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  }, { once: true });
}
