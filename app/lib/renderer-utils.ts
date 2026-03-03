// app/lib/renderer-utils.ts v1.0.0

export const FALL_SPEED = 200;

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, hitLineY: number, theme: string) {
  ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)';
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
  const mainColor = theme === 'cyber' ? '#00ff00' : theme === 'classic' ? '#d97706' : '#6366f1';
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
  const markerColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const blackMarkerColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  
  for (let midi = keyboardRange.start; midi <= keyboardRange.end; midi++) {
    const geo = keyGeometries.get(midi);
    if (geo) {
      ctx.fillStyle = geo.isBlack ? blackMarkerColor : markerColor;
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

  ctx.fillStyle = theme === 'light' ? 'rgba(241, 245, 249, 0.9)' : 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 6);
  ctx.fill();
  
  ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(barX + barWidth / 2 - 1.5, barY - 6, 3, barHeight + 12);

  const perfectZoneWidth = barWidth * (perfectThreshold / goodThreshold);
  ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
  ctx.fillRect(barX + barWidth / 2 - perfectZoneWidth / 2, barY + 1, perfectZoneWidth, barHeight - 2);

  recentHits.forEach(hit => {
    const age = now - hit.timestamp;
    const opacity = 1 - age / 1500;
    const normalizedDiff = Math.max(-1, Math.min(1, hit.timeDiff / goodThreshold));
    const hitX = barX + barWidth / 2 + (normalizedDiff * barWidth / 2);
    
    ctx.fillStyle = hit.type === 'perfect' 
      ? `rgba(52, 211, 153, ${opacity})` 
      : hit.type === 'good' 
        ? `rgba(96, 165, 250, ${opacity})` 
        : `rgba(251, 191, 36, ${opacity})`;

    ctx.beginPath();
    ctx.roundRect(hitX - 3, barY - 2, 6, barHeight + 4, 3);
    ctx.fill();
  });

  ctx.fillStyle = theme === 'light' ? 'rgba(100, 116, 139, 0.9)' : 'rgba(148, 163, 184, 0.9)';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(t.early.toUpperCase(), barX, barY + 28);
  ctx.fillText(t.late.toUpperCase(), barX + barWidth, barY + 28);
  ctx.fillStyle = 'rgba(52, 211, 153, 0.9)';
  ctx.fillText(t.perfect.toUpperCase(), barX + barWidth / 2, barY + 28);
}
