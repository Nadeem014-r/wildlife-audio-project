import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const speciesMap = {
  'rubthr1': { name: 'Ruby-throated Bulbul', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpy9JlAVXqlwuzW3_-BIuL70qa3rOn4nuyfUou35Aw-RYf-x1bsKt0GLt2c4yB2t-_y63xgsLqBh6TMC5pXSVqoQukMmqKqSgZVvR9O1JUu-aQY3VVbV3AbsW7kHPqDMD0EsiO1OXJY7ua7_xINQb5L12RIk0NbssHPH8eowaXo9U5RNRitqv6jzOX_F2mQJPO98M_qcRLZxnwWDG11rMLel3uwKIKLHAhmUSssXDVRmShNsmNjpVXXxy9rePxTdknsCl6Zk9JjIo' },
  'banana': { name: 'Bananaquit', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8ARkHV6hUhpGYEyrVD-HBWQkQwr0U2XMpxGY0yy0vjKd_4doWrjyGAcdGK64suJYmIhtmHal8skLakaijOrYQWjQmAIBRIR-aLCxLBix2w-9t-70X__BGWpuEOoc2S4qAkQR1o6WzLwn9sc6Q6sT6vjnO9s6cPWnF3CaZrV-C26rCbA90o-9IKKYL_IdxI3T9oz6atwewV9E9cRI2H_cGV0EoZz42e9pdqrsLdu4IoIQKavBMUDHtffazQabc06YQ43wCoJiR6o' },
  'soulap1': { name: 'Southern Lapwing', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvaDcP4vhG_nd7UmMCr9sG148ldpUhg-vKWgj6H6d4Jy1aMRD2TX1pDUHML7t7ecp6hjhTaZ1e97YB9267mZZ5ACboIf1XnJd0CDy-hrvtqU330OFeL8YDDM-ypHRAPcU1dig14KPgq72eN05ScHZBFqUl_70FvrrKW7q6fubaoc06QVkcEszWll4EZX3QnyYubREEc5nr7uY_U-2MiILrtDRQHWfhaCwz2wnm5bLtiRzJcCjt81Tc6E3dhNrE2sEgXp0KwSPq6fI' },
  'fepowl': { name: 'Ferruginous Pygmy-Owl', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop' },
  'houspa': { name: 'House Sparrow', img: 'https://images.unsplash.com/photo-1549474706-03c004cdece2?q=80&w=600&auto=format&fit=crop' },
  'osprey': { name: 'Osprey', img: 'https://images.unsplash.com/photo-1596700810769-af7b79140aa9?q=80&w=600&auto=format&fit=crop' },
  'coffal1': { name: 'Collared Forest-Falcon', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop' },
  'socfly1': { name: 'Social Flycatcher', img: 'https://images.unsplash.com/photo-1520108846386-a21edde7ffbb?q=80&w=600&auto=format&fit=crop' },
  'yeofly1': { name: 'Yellow-olive Flycatcher', img: 'https://images.unsplash.com/photo-1518063073995-1f8d48db36de?q=80&w=600&auto=format&fit=crop' },
  'compau': { name: 'Common Pauraque', img: 'https://images.unsplash.com/photo-1620694119932-bb9f1df41ee6?q=80&w=600&auto=format&fit=crop' },
  'bobfly1': { name: 'Boat-billed Flycatcher', img: 'https://images.unsplash.com/photo-1550259508-2e0618ff7e42?q=80&w=600&auto=format&fit=crop' },
  'bncfly': { name: 'Brown-crested Flycatcher', img: 'https://images.unsplash.com/photo-1534063261622-6b943d671cde?q=80&w=600&auto=format&fit=crop' },
  'whtdov': { name: 'White-tipped Dove', img: 'https://images.unsplash.com/photo-1454044569420-1a221f7ed248?q=80&w=600&auto=format&fit=crop' },
  'trsowl': { name: 'Tropical Screech-Owl', img: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?q=80&w=600&auto=format&fit=crop' },
  'bbwduc': { name: 'Black-bellied Whistling-Duck', img: 'https://images.unsplash.com/photo-1549472304-4aff513aedbb?q=80&w=600&auto=format&fit=crop' },
};

const getSpeciesData = (code) =>
  speciesMap[code] || { name: code.replace(/[0-9]/g, '').toUpperCase(), img: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop' };

async function blobToWav(blob) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  const sampleRate = audioBuffer.sampleRate;
  let pos = 0;

  function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) channels.push(audioBuffer.getChannelData(i));

  let interleaved;
  if (numOfChan === 2) {
    interleaved = new Float32Array(audioBuffer.length * numOfChan);
    for (let i = 0, j = 0; i < audioBuffer.length; i++) {
      interleaved[j++] = channels[0][i];
      interleaved[j++] = channels[1][i];
    }
  } else {
    interleaved = channels[0];
  }

  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    pos += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Recording duration tracker hook
function useRecordingTimer(isRecording) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isRecording) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const recordingTimer = useRecordingTimer(isRecording);

  const handleFileUpload = async (file) => {
    if (!file || isUploading) return;
    setError(null);
    setPredictionResult(null);
    setIsUploading(true);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend offline. Open a terminal in the project root and run: uvicorn src.api:app --reload");
      }

      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);

      setTimeout(() => {
        setIsUploading(false);
        setPredictionResult(data);
      }, 800);
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      setUploadedFileName(null);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setPredictionResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const wavBlob = await blobToWav(webmBlob);
          const file = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
          handleFileUpload(file);
        } catch (e) {
          setError('Failed to process microphone audio: ' + e.message);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isUploading) return;
    isRecording ? stopRecording() : startRecording();
  };

  useEffect(() => {
    if (location.search.includes('action=upload')) {
      fileInputRef.current?.click();
      navigate('/', { replace: true });
    } else if (location.search.includes('action=record')) {
      if (!isRecording) startRecording();
      navigate('/', { replace: true });
    }
  }, [location.search]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileUpload(f);
  };

  const resetState = () => {
    setPredictionResult(null);
    setUploadedFileName(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
      {/* Soft background blobs */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-stone-100/80 rounded-full blur-3xl pointer-events-none" />

      {/* Full-screen loading overlay — prevents double-click */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-20 h-20 mb-5">
              <svg className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="55 90" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">eco</span>
              </div>
            </div>
            <p className="text-stone-700 font-semibold text-base tracking-wide">Analyzing audio…</p>
            {uploadedFileName && (
              <p className="text-stone-400 text-sm mt-1 truncate max-w-xs">{uploadedFileName}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center justify-start px-6 pt-28 pb-20 relative z-10">

        {/* ——— HERO ——— */}
        <motion.section
          className="w-full max-w-2xl flex flex-col items-center text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Bird Sound Detection · AI Powered
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-5 tracking-tight leading-[1.05]">
            Identify Birds <br />
            <span className="text-emerald-600">By Their Song</span>
          </h1>

          <p className="text-lg text-stone-500 max-w-lg leading-relaxed">
            Upload an audio clip or record live. Our model identifies the bird species in seconds.
          </p>
        </motion.section>

        {/* ——— ERROR BANNER ——— */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-2xl mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl shadow-sm"
            >
              <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">error</span>
              <div>
                <p className="font-semibold text-sm">Something went wrong</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— MAIN INTERACTION ZONE ——— */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* STATE 1: Upload / Record UI */}
            {!predictionResult && (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35 }}
              >
                {/* Drop zone */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative group w-full rounded-3xl flex flex-col items-center justify-center py-14 px-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'bg-emerald-50 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.08)] scale-[1.01]'
                      : 'bg-white border border-stone-200 hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                      // Reset input so same file can be re-uploaded
                      e.target.value = '';
                    }}
                  />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors ${isDragging ? 'bg-emerald-100' : 'bg-stone-50 group-hover:bg-emerald-50'}`}>
                    <span className={`material-symbols-outlined text-3xl transition-colors ${isDragging ? 'text-emerald-600' : 'text-stone-400 group-hover:text-emerald-500'}`}>
                      upload_file
                    </span>
                  </div>
                  <p className={`text-lg font-bold mb-1.5 transition-colors ${isDragging ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {isDragging ? 'Drop your audio file here' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-sm text-stone-400 font-medium">Supports WAV, OGG, MP3 — up to 50 MB</p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-sm text-stone-400 font-semibold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Record button — with live timer feedback */}
                <button
                  onClick={toggleRecording}
                  disabled={isUploading}
                  className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-base transition-all ${
                    isRecording
                      ? 'bg-red-50 text-red-600 border-2 border-red-300 shadow-[0_0_16px_rgba(239,68,68,0.08)]'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {isRecording ? (
                    <>
                      {/* Pulsing red dot */}
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                      <span>Recording — {recordingTimer} — Tap to stop</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-2xl">mic</span>
                      <span>Record Live Audio</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* STATE 2: Result card */}
            {predictionResult && (
              <motion.div
                key="result-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
                transition={{ duration: 0.45 }}
                className="w-full bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
              >
                {(() => {
                  const top = predictionResult.predictions?.[0];
                  if (!top) {
                    return (
                      <div className="p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-stone-300 block mb-4">search_off</span>
                        <h2 className="text-xl font-bold text-stone-800 mb-2">No Clear Match Found</h2>
                        <p className="text-stone-500 text-sm mb-8">We couldn't confidently identify a bird in this audio.</p>
                        <button onClick={resetState} className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors">
                          Try Another File
                        </button>
                      </div>
                    );
                  }

                  const sp = getSpeciesData(top.species);
                  const confNum = (top.confidence * 100).toFixed(1);

                  return (
                    <div className="flex flex-col sm:flex-row">
                      {/* Bird image */}
                      <div className="w-full sm:w-52 h-52 sm:h-auto flex-shrink-0 relative bg-stone-100">
                        <img src={sp.img} alt={sp.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-3 left-3 text-white text-[10px] font-bold uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          Detected
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col justify-center p-8 flex-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          Top Match
                        </div>
                        {/* Species name links to Wikipedia */}
                        <a
                          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(sp.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 mb-1"
                        >
                          <h2 className="text-2xl font-black text-stone-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                            {sp.name}
                          </h2>
                          <span className="material-symbols-outlined text-base text-stone-300 group-hover:text-emerald-500 transition-colors" title="View on Wikipedia">
                            open_in_new
                          </span>
                        </a>
                        {uploadedFileName && (
                          <p className="text-xs text-stone-400 mb-5 truncate">
                            <span className="material-symbols-outlined text-xs align-middle mr-1">audio_file</span>
                            {uploadedFileName}
                          </p>
                        )}

                        {/* Confidence bar */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Confidence</span>
                            <span className="text-xl font-black text-emerald-600">{confNum}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-emerald-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${confNum}%` }}
                              transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={resetState}
                            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-sm transition-colors"
                          >
                            Try Again
                          </button>
                          <a
                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(sp.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-white border border-stone-200 hover:border-emerald-200 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">menu_book</span>
                            Wikipedia
                          </a>
                          <button
                            onClick={() => navigate('/results', { state: { predictionData: predictionResult } })}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                          >
                            Full Analysis
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ——— TRUST BADGES ——— */}
        <motion.div
          className="mt-14 flex flex-wrap justify-center gap-6 text-xs text-stone-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {[
            { icon: 'bolt', label: 'AI Detection in Seconds' },
            { icon: 'lock', label: 'Audio Processed Locally' },
            { icon: 'library_music', label: '24+ Bird Species' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-emerald-500 text-base">{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
