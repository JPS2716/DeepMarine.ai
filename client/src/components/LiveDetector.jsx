import React, { useCallback, useEffect, useRef, useState } from 'react';
import { detectImageBlob } from '../lib/api.js';
import CanvasOverlay from './CanvasOverlay.jsx';

export default function LiveDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });

  // Initialize camera
  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setVideoSize({ w: videoRef.current.videoWidth, h: videoRef.current.videoHeight });
    }
  }, []);

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  async function captureAndDetect() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return; // not ready

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (!blob) return;
    try {
      const res = await detectImageBlob(blob);
      setPredictions(res?.predictions || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('live detect error', e);
    }
  }

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let lastRun = 0;
    const intervalMs = 500; // throttle ~2fps for demo

    const tick = async (ts) => {
      if (!running || cancelled) return;
      if (ts - lastRun >= intervalMs) {
        lastRun = ts;
        try { await captureAndDetect(); } catch (e) { /* ignore to keep loop */ }
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);

  async function onStart() {
    await startCamera();
    setRunning(true);
  }

  function onStop() {
    setRunning(false);
    setPredictions([]);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={onStart} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Start Camera</button>
        <button onClick={onStop} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Stop</button>
      </div>

      <div className="relative mx-auto max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          muted
        />
        <CanvasOverlay
          baseWidth={videoRef.current?.clientWidth || 0}
          baseHeight={videoRef.current?.clientHeight || 0}
          naturalWidth={videoSize.w}
          naturalHeight={videoSize.h}
          predictions={predictions}
        />
      </div>

      {running && (
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-4 h-4 border-2 border-blue-600 border-top-transparent border-t-transparent rounded-full animate-spin" />
          Running live detection...
        </div>
      )}

      {predictions?.length > 0 && (
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">Detections</div>
          <ul className="list-disc ml-5 space-y-1">
            {predictions.map((p, idx) => {
              const cx = videoSize.w / 2;
              const cy = videoSize.h / 2;
              const dx = (p.x ?? 0) - cx;
              const dy = (p.y ?? 0) - cy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              const size = `${Math.round(p.width)}x${Math.round(p.height)}px`;
              return (
                <li key={idx}>
                  <div>{p.class} - {(p.confidence * 100).toFixed(1)}%</div>
                  <div className="text-gray-500 ml-2">
                    size: {size} · distance: {Math.round(distance)}px · angle: {angle.toFixed(1)}°
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


