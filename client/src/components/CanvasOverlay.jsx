import React, { useEffect, useRef } from 'react';

function drawDetections(ctx, predictions, scaleX, scaleY) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineWidth = 2;
  ctx.font = '14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';

  predictions?.forEach(pred => {
    const { x, y, width, height, class: label, confidence } = pred;
    const left = (x - width / 2) * scaleX;
    const top = (y - height / 2) * scaleY;
    const w = width * scaleX;
    const h = height * scaleY;

    ctx.strokeStyle = '#22c55e';
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.strokeRect(left, top, w, h);
    ctx.fillRect(left, top, w, h);

    const labelText = `${label} ${(confidence * 100).toFixed(1)}%`;
    const padding = 4;
    ctx.font = 'bold 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    const metrics = ctx.measureText(labelText);
    const labelW = metrics.width + padding * 2;
    const labelH = 18;

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(left, Math.max(0, top - labelH), labelW, labelH);
    ctx.fillStyle = '#fff';
    ctx.fillText(labelText, left + padding, Math.max(12, top - 5));
  });
}

export default function CanvasOverlay({
  baseWidth,
  baseHeight,
  naturalWidth,
  naturalHeight,
  predictions
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scaleX = baseWidth / (naturalWidth || baseWidth);
    const scaleY = baseHeight / (naturalHeight || baseHeight);
    drawDetections(ctx, predictions, scaleX, scaleY);
  }, [baseWidth, baseHeight, naturalWidth, naturalHeight, predictions]);

  return (
    <canvas
      ref={canvasRef}
      width={baseWidth}
      height={baseHeight}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}


