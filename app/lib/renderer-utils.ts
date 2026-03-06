// app/lib/renderer-utils.ts v2.1.5

export const FALL_SPEED = 200;

// Pre-calculated colors to reduce GC pressure
const COLORS = {
  light: {
    grid: 'rgba(0, 0, 0, 0.05)',
    marker: 'rgba(0, 0, 0, 0.1)',
    blackMarker: 'rgba(0, 0, 0, 0.2)',
    barBg: 'rgba(241, 245, 249, 0.9)',
    barStroke: 'rgba(0, 0, 0, 0.15)',
    barCenter: 'rgba(0, 0, 0, 0.4)',
    text: 'rgba(100, 116, 139, 0.9)',
    noteWhite: 'rgba(0, 0, 0, 0.8)',
  },
  dark: {
    grid: 'rgba(255, 255, 255, 0.02)',
    marker: 'rgba(255, 255, 255, 0.1)',
    blackMarker: 'rgba(255, 255, 255, 0.2)',
    barBg: 'rgba(15, 23, 42, 0.8)',
    barStroke: 'rgba(255, 255, 255, 0.15)',
    barCenter: 'rgba(255, 255, 255, 0.4)',
    text: 'rgba(148, 163, 184, 0.9)',
    noteWhite: 'rgba(255, 255, 255, 0.8)',
  },
  themes: {
    cyber: '#00ff00',
    classic: '#d97706',
    default: '#6366f1'
  },
  perfect: 'rgba(52, 211, 153, 0.15)',
  perfectText: 'rgba(52, 211, 153, 0.9)',
  hit: {
    perfect: '52, 211, 153',
    good: '96, 165, 250',
    miss: '251, 191, 36'
  }
};

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
}

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, hitLineY: number, theme: string) {
  ctx.strokeStyle = theme === 'light' ? COLORS.light.grid : COLORS.dark.grid;
  ctx.lineWidth = 1;
  const gridSpacing = 0.5 * FALL_SPEED;
  ctx.beginPath();
  for (let y = hitLineY; y > 0; y -= gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

export function drawHitLine(ctx: CanvasRenderingContext2D, width: number, hitLineY: number, theme: string) {
  const mainColor = theme === 'cyber' ? COLORS.themes.cyber : theme === 'classic' ? COLORS.themes.classic : COLORS.themes.default;
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hitLineY);
  ctx.lineTo(width, hitLineY);
  ctx.stroke();
}

export function drawKeyMarkers(
  ctx: CanvasRenderingContext2D, 
  hitLineY: number, 
  hitLineHeight: number, 
  keyboardRange: { start: number; end: number }, 
  keyGeometries: Map<number, { x: number, width: number, isBlack: boolean }>,
  theme: string
) {
  if (hitLineHeight <= 0) return;
  const colors = theme === 'light' ? COLORS.light : COLORS.dark;
  
  for (let midi = keyboardRange.start; midi <= keyboardRange.end; midi++) {
    const geo = keyGeometries.get(midi);
    if (geo) {
      ctx.fillStyle = geo.isBlack ? colors.blackMarker : colors.marker;
      ctx.fillRect(geo.x, hitLineY, geo.isBlack ? geo.width : 1, hitLineHeight);
    }
  }
}

export function drawTimingBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  theme: string,
  t: Record<string, string>,
  recentHits: { timeDiff: number; timestamp: number; type: string }[],
  perfectThreshold: number,
  goodThreshold: number
) {
  const barWidth = Math.min(400, width * 0.6);
  const barHeight = 12;
  const barX = (width - barWidth) / 2;
  const barY = 40;
  const now = Date.now();
  const colors = theme === 'light' ? COLORS.light : COLORS.dark;

  ctx.fillStyle = colors.barBg;
  ctx.beginPath();
  roundRect(ctx, barX, barY, barWidth, barHeight, 6);
  ctx.fill();
  
  ctx.strokeStyle = colors.barStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.barCenter;
  ctx.fillRect(barX + barWidth / 2 - 1.5, barY - 6, 3, barHeight + 12);

  const perfectZoneWidth = barWidth * (perfectThreshold / goodThreshold);
  ctx.fillStyle = COLORS.perfect;
  ctx.fillRect(barX + barWidth / 2 - perfectZoneWidth / 2, barY + 1, perfectZoneWidth, barHeight - 2);

  recentHits.forEach(hit => {
    const age = now - hit.timestamp;
    const opacity = 1 - age / 1500;
    const normalizedDiff = Math.max(-1, Math.min(1, hit.timeDiff / goodThreshold));
    const hitX = barX + barWidth / 2 + (normalizedDiff * barWidth / 2);
    
    // Use pre-calculated RGB values
    const rgb = hit.type === 'perfect' ? COLORS.hit.perfect : hit.type === 'good' ? COLORS.hit.good : COLORS.hit.miss;
    ctx.fillStyle = `rgba(${rgb}, ${opacity})`;

    ctx.beginPath();
    roundRect(ctx, hitX - 3, barY - 2, 6, barHeight + 4, 3);
    ctx.fill();
  });

  ctx.fillStyle = colors.text;
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(t.early.toUpperCase(), barX, barY + 28);
  ctx.fillText(t.late.toUpperCase(), barX + barWidth, barY + 28);
  ctx.fillStyle = COLORS.perfectText;
  ctx.fillText(t.perfect.toUpperCase(), barX + barWidth / 2, barY + 28);
}
