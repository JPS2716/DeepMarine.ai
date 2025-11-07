import React, { useState } from 'react';
import UploadDetector from './components/UploadDetector.jsx';
import LiveDetector from './components/LiveDetector.jsx';
import VideoUploadDetector from './components/VideoUploadDetector.jsx';

export default function App() {
  const [tab, setTab] = useState('live');

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Roboflow Object Detection</h1>
            <p className="text-gray-600 mt-1">Upload an image or use your webcam to detect objects.</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setTab('upload')}
              className={`px-4 py-2 rounded-md ${tab === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Upload Image
            </button>
            <button
              onClick={() => setTab('live')}
              className={`px-4 py-2 rounded-md ${tab === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Start Live Camera Detection
            </button>
            <button
              onClick={() => setTab('video')}
              className={`px-4 py-2 rounded-md ${tab === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Upload Video
            </button>
          </div>

          {tab === 'upload' && <UploadDetector />}
          {tab === 'live' && <LiveDetector />}
          {tab === 'video' && <VideoUploadDetector />}
        </div>
      </div>
    </div>
  );
}


