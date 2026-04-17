import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

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

const getSpeciesData = (pred) => {
  const code = pred.species;
  const apiName = pred.common_name;
  
  // Use curated image if we have it, otherwise fallback to generic
  const curated = speciesMap[code];
  return {
    name: apiName || curated?.name || code.replace(/[0-9]/g, '').toUpperCase(),
    img: curated?.img || 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop'
  };
};

const probBar = {
  hidden: { width: '0%' },
  visible: (custom) => ({
    width: custom,
    transition: { duration: 1.2, ease: 'easeOut', delay: 0.5 },
  }),
};

const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } },
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export default function DetectionResults() {
  const location = useLocation();
  const data = location.state?.predictionData;
  const isMock = !data;

  const topPrediction = !isMock && data.predictions.length > 0
    ? data.predictions[0]
    : { species: 'rubthr1', confidence: 0.947 };

  const predictionsArray = !isMock
    ? data.predictions
    : [
        { species: 'rubthr1', confidence: 0.947 },
        { species: 'houspa', confidence: 0.031 },
        { species: 'socfly1', confidence: 0.014 },
        { species: 'trsowl', confidence: 0.005 },
      ];

  const specImage = !isMock
    ? data.spectrogram_image
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXCJwB1cPMOx_9qG9hRtNqVEH0bc9vGyeY96eCjerKqNSN4vpFJhXLt-dqAogxLhj1vUc5jG-sPHsTzYusQ7DKWifXapGjKIAfrG1NO-IcBDhJtzmvXhqViVyUr52efJClov5O9LlzV88-Ohgw-oGF_EVQBeNXAr-78h3dNjsX5WzupUbjYlznaaIn4BcS27Cg_s5geXaJxUhT9QEwPtCxzTbiJ-5nOeB9HV8X764ZfMnSaml4u9PI9SHNgD6HSTYkTIoZtPZjVaQ';

  const topSpeciesInfo = getSpeciesData(topPrediction);
  const topConfidenceNum = (topPrediction.confidence * 100).toFixed(1);
  const formatConf = (v) => (v * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-stone-50 pt-20 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[480px] h-[480px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[480px] h-[480px] bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto px-6 py-12 space-y-8 relative z-10"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumb & Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <Link to="/" className="hover:text-emerald-700 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </Link>
              <span className="text-stone-300">/</span>
              <span className="text-stone-800">Analysis Results</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Audio Analysis</h1>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full self-start sm:self-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">AI Model Active</span>
          </div>
        </motion.div>

        {/* Mock data notice */}
        {isMock && (
          <motion.div variants={fadeUp} className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600">info</span>
            Viewing sample data — upload or record audio from the homepage to see your real results.
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT — Top Detection */}
          <motion.div variants={fadeUp} className="lg:col-span-3 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row h-full">
              {/* Bird image */}
              <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 relative bg-stone-100">
                <img
                  src={topSpeciesInfo.img}
                  alt={topSpeciesInfo.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop'; }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-[10px] font-bold uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  Top Match
                </span>
              </div>

              {/* Detection details */}
              <div className="flex flex-col justify-center p-7 flex-1">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-3">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  Detected Species
                </span>
                {/* Species name — click to open Wikipedia */}
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topSpeciesInfo.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 mb-2"
                >
                  <h2 className="text-3xl font-black text-stone-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                    {topSpeciesInfo.name}
                  </h2>
                  <span className="material-symbols-outlined text-lg text-stone-300 group-hover:text-emerald-500 transition-colors" title="View on Wikipedia">
                    open_in_new
                  </span>
                </a>
                <p className="text-sm text-stone-500 mb-6">Code: <span className="font-semibold text-stone-700">{topPrediction.species}</span></p>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Confidence</span>
                    <span className="text-2xl font-black text-emerald-700">{topConfidenceNum}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${topConfidenceNum}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Probability Distribution */}
          <motion.div variants={fadeUp} className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 shadow-sm p-7">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Other Candidates</h3>
            <div className="space-y-5">
              {predictionsArray.slice(0, 5).map((pred, i) => {
                const conf = formatConf(pred.confidence);
                const spInfo = getSpeciesData(pred);
                const isTop = i === 0;
                return (
                  <div key={pred.species}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold truncate pr-2 ${isTop ? 'text-stone-900' : 'text-stone-600'}`}>
                        {spInfo.name}
                      </span>
                      <span className={`text-sm font-black flex-shrink-0 ${isTop ? 'text-emerald-700' : 'text-stone-400'}`}>
                        {conf}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        custom={`${conf}%`}
                        variants={probBar}
                        initial="hidden"
                        animate="visible"
                        className={`h-full rounded-full ${isTop ? 'bg-emerald-500' : 'bg-stone-300'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Spectrogram Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-50">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Mel Spectrogram</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Spectrogram image */}
            <div className="relative bg-stone-900 aspect-video md:aspect-auto">
              <img
                src={specImage}
                alt="Mel Spectrogram"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            {/* Audio metadata */}
            <div className="p-8 flex flex-col justify-center gap-6">
              <p className="text-sm text-stone-600 leading-relaxed">
                The acoustic pattern detected in this audio strongly correlates with the vocal fingerprint of the{' '}
                <span className="font-bold text-stone-900">{topSpeciesInfo.name}</span>.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Clip Length</p>
                  <p className="text-sm font-bold text-stone-800">{data?.duration || '5.0s'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Sample Rate</p>
                  <p className="text-sm font-bold text-stone-800">32 kHz</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Source</p>
                  <p className="text-sm font-bold text-stone-800 truncate">{data?.filename || 'audio.wav'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pb-4">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-stone-200 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50 hover:border-stone-300 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            Analyze Another File
          </Link>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topSpeciesInfo.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-stone-200 text-stone-700 font-semibold rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">menu_book</span>
            Wikipedia
          </a>
          <Link
            to="/gallery"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">photo_library</span>
            Species Library
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
