import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link, Navigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';

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

export default function DetectionResults() {
  const location = useLocation();
  const data = location.state?.predictionData;

  // Render dummy data entirely for architectural design visually if user arrives on this page raw
  const isMock = !data;

  // Extracted dynamically from FastAPI output!
  const topPrediction = !isMock && data.predictions.length > 0 ? data.predictions[0] : { species: 'rubthr1', confidence: 0.947 };
  const predictionsArray = !isMock ? data.predictions : [
    { species: 'rubthr1', confidence: 0.947 },
    { species: 'houspa', confidence: 0.031 },
    { species: 'socfly1', confidence: 0.014 },
    { species: 'trsowl', confidence: 0.005 }
  ];

  const specImage = !isMock ? data.spectrogram_image : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXCJwB1cPMOx_9qG9hRtNqVEH0bc9vGyeY96eCjerKqNSN4vpFJhXLt-dqAogxLhj1vUc5jG-sPHsTzYusQ7DKWifXapGjKIAfrG1NO-IcBDhJtzmvXhqViVyUr52efJClov5O9LlzV88-Ohgw-oGF_EVQBeNXAr-78h3dNjsX5WzupUbjYlznaaIn4BcS27Cg_s5geXaJxUhT9QEwPtCxzTbiJ-5nOeB9HV8X764ZfMnSaml4u9PI9SHNgD6HSTYkTIoZtPZjVaQ';

  const formatConfidenceString = (confVal) => (confVal * 100).toFixed(1);

  // Fallback map getter
  const getSpeciesData = (code) => speciesMap[code] || { name: code.toUpperCase(), img: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop' };
  
  const topSpeciesInfo = getSpeciesData(topPrediction.species);
  const topConfidenceNum = (topPrediction.confidence * 100).toFixed(1);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  const probBar = {
    hidden: { width: "0%" },
    visible: custom => ({
      width: custom,
      transition: { duration: 1.2, ease: "easeOut", delay: 0.5 }
    })
  };

  return (
    <div className="flex min-h-screen pt-20">
      <SideNavBar />

      <main className="flex-1 monolith-grid relative bg-[#0e0e0e] overflow-hidden">
        <motion.div 
          className="max-w-7xl mx-auto p-12 space-y-12"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {isMock && (
             <div className="w-full bg-yellow-600/20 text-yellow-500 border border-yellow-600 p-4 rounded-lg text-sm font-medium">
                Note: Seeing sample data since you navigated here without uploading an audio file.
             </div>
          )}
          
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#c6c6c6] text-[10px] uppercase tracking-[0.2em] mb-4 font-bold">
                <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[12px]">arrow_back</span>
                  BACK
                </Link>
                <span className="opacity-30">/</span>
                <span className="hover:text-white cursor-pointer transition-colors">HOME</span>
                <span className="opacity-30">/</span>
                <span className="text-white">RESULTS</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Audio Analysis Result</h1>
            </div>
            <div className="flex items-center gap-3 bg-[#131313] px-5 py-2 rounded-full border border-[#1f1f1f]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span className="text-[9px] font-black text-[#c6c6c6] uppercase tracking-[0.25em]">Backend AI Linked</span>
            </div>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
            {/* Left Panel (40%) */}
            <div className="lg:col-span-4 space-y-10">

              <motion.section variants={fadeUp} className="bg-[#131313] rounded-xl overflow-hidden border border-[#1f1f1f] shadow-2xl">
                <div className="p-6 pb-2">
                  <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-6 opacity-60">Generated Mel Spectrogram</h3>
                  <div className="relative aspect-video rounded bg-[#0e0e0e] border border-[#1f1f1f] overflow-hidden group">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      src={specImage} 
                      className="w-full h-full object-cover grayscale brightness-125 contrast-150 mix-blend-screen opacity-80" 
                      alt="Spectrogram"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-60 pointer-events-none"></div>
                  </div>
                </div>

                <div className="p-6 pt-4 bg-[#1f1f1f]/20">
                  <div className="flex items-center gap-6 mb-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                    </motion.button>
                    <div className="flex-1">
                      <div className="h-[3px] w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-white relative"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#c6c6c6] mt-3 font-mono tracking-wider">
                        <span>Playback Audio Snippet</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1f1f1f]">
                    <div className="text-center">
                      <p className="text-[8px] text-[#c6c6c6] font-black uppercase tracking-[0.2em] mb-1">Target Length</p>
                      <p className="text-xs font-bold text-white italic">5.0s Clip</p>
                    </div>
                    <div className="text-center border-x border-[#1f1f1f]">
                      <p className="text-[8px] text-[#c6c6c6] font-black uppercase tracking-[0.2em] mb-1">Downsample</p>
                      <p className="text-xs font-bold text-white italic">32kHz</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-[#c6c6c6] font-black uppercase tracking-[0.2em] mb-1">Input Source</p>
                      <p className="text-[8px] font-bold text-white truncate max-w-[80px] mx-auto italic">{data?.filename || 'mock.wav'}</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.div variants={fadeUp} className="glass-panel p-6 rounded-xl border border-[#1f1f1f] relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-white opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700">
                  <span className="material-symbols-outlined text-[120px]">music_note</span>
                </div>
                <div className="flex items-start gap-4 relative z-10 w-full">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 shrink-0">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  </div>
                  <div>
                    <p className="text-white font-medium leading-relaxed text-sm">
                      🎵 I am {topConfidenceNum}% confident this sounds just like a <span className="text-white font-black underline decoration-white/30 underline-offset-4">{topSpeciesInfo.name}!</span>
                    </p>
                    <p className="text-[10px] text-[#c6c6c6] mt-2 tracking-wide uppercase font-bold opacity-60">High Fidelity Capture</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Panel (60%) */}
            <div className="lg:col-span-6 space-y-10">
              <motion.div variants={fadeUp} className="relative bg-[#131313] rounded-xl p-10 border border-[#1f1f1f] shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.02] opacity-50"></div>
                <div className="relative flex flex-col md:flex-row gap-10 items-center">
                  
                  <div className="flex-1">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      <span className="material-symbols-outlined text-[10px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                      TOP DETECTION
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic drop-shadow-lg">{topSpeciesInfo.name}</h2>
                    
                    <div className="bg-[#0e0e0e] rounded-xl p-6 border border-[#1f1f1f] hover:border-[#333333] transition-colors duration-300">
                      <div className="flex items-start gap-6">
                        <div className="w-24 h-24 shrink-0 rounded-lg border border-[#1f1f1f] overflow-hidden grayscale brightness-90 group-hover:grayscale-0 transition-all duration-700">
                          <img 
                            src={topSpeciesInfo.img} 
                            className="w-full h-full object-cover" 
                            alt={topSpeciesInfo.name}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] text-[#c6c6c6] uppercase font-black tracking-[0.2em] mb-3 opacity-50">Database Lexicon</p>
                          <p className="text-[11px] text-[#e2e2e2] leading-relaxed line-clamp-3 font-medium">
                            Detected vocal pattern heavily correlates with the neural acoustic fingerprint of the {topSpeciesInfo.name.toLowerCase()}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confidence Progress Arc */}
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="relative w-44 h-44 group-hover:scale-105 transition-transform duration-500">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-[#1f1f1f]"></circle>
                        <motion.circle 
                          cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          initial={{ strokeDasharray: "276", strokeDashoffset: "276" }}
                          animate={{ strokeDashoffset: 276 - (276 * topPrediction.confidence) }} 
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        ></motion.circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          className="text-4xl font-black text-white italic"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          {topConfidenceNum}
                        </motion.span>
                        <span className="text-[8px] text-[#c6c6c6] font-black uppercase tracking-[0.3em] mt-1">% CONFIDENCE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic Top 5 Detections Chart */}
              <motion.div variants={fadeUp} className="bg-[#131313] rounded-xl p-10 border border-[#1f1f1f] shadow-xl">
                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-10 opacity-60">Probability Distribution</h3>
                <div className="space-y-8">
                  {predictionsArray.slice(0, 5).map((pred, i) => {
                    const conf = formatConfidenceString(pred.confidence);
                    const spInfo = getSpeciesData(pred.species);
                    const isTop = i === 0;

                    return (
                      <div key={pred.species} className="space-y-3 group/item">
                        <div className="flex justify-between items-end">
                          <span className={`text-sm font-black uppercase tracking-tight ${isTop ? 'text-white italic' : 'text-[#c6c6c6]'}`}>{spInfo.name}</span>
                          <span className={`text-sm font-black ${isTop ? 'text-white text-lg' : 'text-[#c6c6c6]'}`}>{conf}%</span>
                        </div>
                        <div className="h-[2px] w-full bg-[#1f1f1f] relative rounded-full overflow-hidden">
                          <motion.div 
                            custom={`${conf}%`}
                            variants={probBar}
                            className={`absolute top-0 left-0 h-full rounded-full ${isTop ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-[#c6c6c6] opacity-30'}`}
                          ></motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
