import React, { useRef, useState } from 'react';
import { detectImageBlob } from '../lib/api.js';
import CanvasOverlay from './CanvasOverlay.jsx';

export default function UploadDetector() {
  const [imageUrl, setImageUrl] = useState(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPredictions([]);
    setLoading(true);
    try {
      const res = await detectImageBlob(file);
      setPredictions(res?.predictions || []);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          Upload Image
        </label>
      </div>

      {imageUrl && (
        <div className="relative mx-auto max-w-2xl border rounded-lg overflow-hidden bg-black">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Uploaded"
            className="block w-full h-auto"
            onLoad={(e) => setImgNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          />
          <CanvasOverlay
            baseWidth={imgRef.current?.clientWidth || 0}
            baseHeight={imgRef.current?.clientHeight || 0}
            naturalWidth={imgNatural.w}
            naturalHeight={imgNatural.h}
            predictions={predictions}
          />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Running inference...
        </div>
      )}

      {predictions?.length > 0 && (
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">Detections</div>
          <ul className="list-disc ml-5 space-y-1">
            {predictions.map((p, idx) => {
              const cx = imgNatural.w / 2;
              const cy = imgNatural.h / 2;
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


