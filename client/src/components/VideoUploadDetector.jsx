import React, { useCallback, useEffect, useRef, useState } from 'react';
import { detectImageBlob } from '../lib/api.js';
import CanvasOverlay from './CanvasOverlay.jsx';

export default function VideoUploadDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(2);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Revoke previous URL if exists
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setPredictions([]);
    setRunning(false);
    setVideoSize({ w: 0, h: 0 });
    
    // eslint-disable-next-line no-console
    console.log('Video file selected:', file.name, file.type, file.size);
  }

  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.paused || video.ended) return;
    
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
    
    if (!blob) return;
    
    try {
      const res = await detectImageBlob(blob);
      setPredictions(res?.predictions || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('video detect error', e);
    }
  }, []);

  useEffect(() => {
    if (!running || !videoUrl) return;
    
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    
    let cancelled = false;
    const intervalMs = Math.max(200, 1000 / Math.max(1, fps));
    
    const id = setInterval(() => {
      if (cancelled) return;
      const v = videoRef.current;
      if (!v || v.paused || v.ended) {
        setRunning(false);
        return;
      }
      captureAndDetect().catch(() => {});
    }, intervalMs);
    
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [running, fps, videoUrl, captureAndDetect]);

  function onPlay() {
    const v = videoRef.current;
    if (!v) return;
    // Wait a bit for video to be ready
    setTimeout(() => {
      if (v && !v.paused) {
        setVideoSize({ w: v.videoWidth || 0, h: v.videoHeight || 0 });
        setRunning(true);
      }
    }, 100);
  }

  function onPause() {
    setRunning(false);
  }

  function onEnded() {
    setRunning(false);
  }

  function onError(e) {
    // eslint-disable-next-line no-console
    console.error('Video error:', e);
    const video = videoRef.current;
    if (video) {
      // eslint-disable-next-line no-console
      console.error('Video error details:', {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        src: video.src
      });
    }
  }

  function onCanPlay() {
    const v = videoRef.current;
    if (v) {
      setVideoSize({ w: v.videoWidth || 0, h: v.videoHeight || 0 });
      // eslint-disable-next-line no-console
      console.log('Video ready to play:', { width: v.videoWidth, height: v.videoHeight });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
          <input type="file" accept="video/*" className="hidden" onChange={onFileChange} />
          Upload Video
        </label>
        <label className="text-sm text-gray-700 flex items-center gap-2">
          FPS
          <input type="number" min={1} max={10} value={fps} onChange={(e) => setFps(Number(e.target.value) || 2)} className="w-16 border rounded px-2 py-1" />
        </label>
      </div>

      <div className="relative mx-auto max-w-2xl bg-black rounded-lg overflow-hidden">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto block"
              controls
              playsInline
              preload="metadata"
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              onError={onError}
              onCanPlay={onCanPlay}
              onLoadedMetadata={() => {
                const v = videoRef.current;
                if (v) {
                  setVideoSize({ w: v.videoWidth || 0, h: v.videoHeight || 0 });
                  // eslint-disable-next-line no-console
                  console.log('Video metadata loaded:', { width: v.videoWidth, height: v.videoHeight });
                }
              }}
            />
            {videoSize.w > 0 && videoSize.h > 0 && (
              <CanvasOverlay
                baseWidth={videoRef.current?.clientWidth || videoSize.w}
                baseHeight={videoRef.current?.clientHeight || videoSize.h}
                naturalWidth={videoSize.w}
                naturalHeight={videoSize.h}
                predictions={predictions}
              />
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">Select a video file to start.</div>
        )}
      </div>

      {running && (
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Running video inference...
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


