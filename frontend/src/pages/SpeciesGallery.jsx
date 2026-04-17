import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const speciesData = [
  { name: 'Ruby-throated Bulbul', code: 'rubthr1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpy9JlAVXqlwuzW3_-BIuL70qa3rOn4nuyfUou35Aw-RYf-x1bsKt0GLt2c4yB2t-_y63xgsLqBh6TMC5pXSVqoQukMmqKqSgZVvR9O1JUu-aQY3VVbV3AbsW7kHPqDMD0EsiO1OXJY7ua7_xINQb5L12RIk0NbssHPH8eowaXo9U5RNRitqv6jzOX_F2mQJPO98M_qcRLZxnwWDG11rMLel3uwKIKLHAhmUSssXDVRmShNsmNjpVXXxy9rePxTdknsCl6Zk9JjIo' },
  { name: 'Bananaquit', code: 'banana', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8ARkHV6hUhpGYEyrVD-HBWQkQwr0U2XMpxGY0yy0vjKd_4doWrjyGAcdGK64suJYmIhtmHal8skLakaijOrYQWjQmAIBRIR-aLCxLBix2w-9t-70X__BGWpuEOoc2S4qAkQR1o6WzLwn9sc6Q6sT6vjnO9s6cPWnF3CaZrV-C26rCbA90o-9IKKYL_IdxI3T9oz6atwewV9E9cRI2H_cGV0EoZz42e9pdqrsLdu4IoIQKavBMUDHtffazQabc06YQ43wCoJiR6o' },
  { name: 'Southern Lapwing', code: 'soulap1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvaDcP4vhG_nd7UmMCr9sG148ldpUhg-vKWgj6H6d4Jy1aMRD2TX1pDUHML7t7ecp6hjhTaZ1e97YB9267mZZ5ACboIf1XnJd0CDy-hrvtqU330OFeL8YDDM-ypHRAPcU1dig14KPgq72eN05ScHZBFqUl_70FvrrKW7q6fubaoc06QVkcEszWll4EZX3QnyYubREEc5nr7uY_U-2MiILrtDRQHWfhaCwz2wnm5bLtiRzJcCjt81Tc6E3dhNrE2sEgXp0KwSPq6fI' },
  { name: 'Ferruginous Pygmy-Owl', code: 'fepowl', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop' },
  { name: 'House Sparrow', code: 'houspa', img: 'https://images.unsplash.com/photo-1549474706-03c004cdece2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Osprey', code: 'osprey', img: 'https://images.unsplash.com/photo-1596700810769-af7b79140aa9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Collared Forest-Falcon', code: 'coffal1', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop' },
  { name: 'Social Flycatcher', code: 'socfly1', img: 'https://images.unsplash.com/photo-1520108846386-a21edde7ffbb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Yellow-olive Flycatcher', code: 'yeofly1', img: 'https://images.unsplash.com/photo-1518063073995-1f8d48db36de?q=80&w=600&auto=format&fit=crop' },
  { name: 'Common Pauraque', code: 'compau', img: 'https://images.unsplash.com/photo-1620694119932-bb9f1df41ee6?q=80&w=600&auto=format&fit=crop' },
  { name: 'Boat-billed Flycatcher', code: 'bobfly1', img: 'https://images.unsplash.com/photo-1550259508-2e0618ff7e42?q=80&w=600&auto=format&fit=crop' },
  { name: 'Brown-crested Flycatcher', code: 'bncfly', img: 'https://images.unsplash.com/photo-1534063261622-6b943d671cde?q=80&w=600&auto=format&fit=crop' },
  { name: 'White-tipped Dove', code: 'whtdov', img: 'https://images.unsplash.com/photo-1454044569420-1a221f7ed248?q=80&w=600&auto=format&fit=crop' },
  { name: 'Tropical Screech-Owl', code: 'trsowl', img: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Black-bellied Whistling-Duck', code: 'bbwduc', img: 'https://images.unsplash.com/photo-1549472304-4aff513aedbb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Blue Jay', code: 'blujay', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop' },
  { name: 'Northern Cardinal', code: 'norcar', img: 'https://images.unsplash.com/photo-1510006764491-d8a4369a2503?q=80&w=600&auto=format&fit=crop' },
  { name: 'American Robin', code: 'amrob', img: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop' },
  { name: 'European Starling', code: 'eursta', img: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?q=80&w=600&auto=format&fit=crop' },
  { name: 'Barn Owl', code: 'baowl', img: 'https://images.unsplash.com/photo-1516246340243-d2d88fae498c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Bald Eagle', code: 'baleag', img: 'https://images.unsplash.com/photo-1501602715617-64906ec1459a?q=80&w=600&auto=format&fit=crop' },
  { name: 'Mallard', code: 'mallar', img: 'https://images.unsplash.com/photo-1528659556277-24a91f531d04?q=80&w=600&auto=format&fit=crop' },
  { name: 'Hummingbird', code: 'humbir', img: 'https://images.unsplash.com/photo-1507202758117-62f3a6cf544b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Toucan', code: 'toucan', img: 'https://images.unsplash.com/photo-1552596417-6d63d0c410ba?q=80&w=600&auto=format&fit=crop' },
];

export default function SpeciesGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setPlayingId(null);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = (species) => {
    if (playingId === species.code) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (playingId) audioRef.current.pause();
      audioRef.current.src = `/audio-sample/${species.code}`;
      audioRef.current.play().catch((e) => console.error('Audio playback failed', e));
      setPlayingId(species.code);
    }
  };

  const filteredSpecies = speciesData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <main className="pt-28 pb-24 px-6 max-w-7xl mx-auto w-full relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-4">
              Species Library
            </div>
            <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">
              220 Supported Bird Species
            </h1>
            <p className="text-stone-500 max-w-xl">
              Browse the full library of birds our model can detect. Click any card to hear their acoustic signature.
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-stone-200 rounded-full py-3 pl-12 pr-5 text-sm w-full md:w-72 text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all shadow-sm"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          <AnimatePresence>
            {filteredSpecies.map((species) => (
              <motion.div
                key={species.code}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                layout
                onClick={() => toggleAudio(species)}
                whileHover={{ y: -4 }}
                className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                  playingId === species.code
                    ? 'bg-emerald-50 border-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                    : 'bg-white border-stone-100 hover:border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
                  <img
                    src={species.img}
                    alt={species.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop'; }}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      playingId !== species.code ? 'grayscale-[30%]' : ''
                    }`}
                  />

                  {/* Playing overlay */}
                  <AnimatePresence>
                    {playingId === species.code && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-900/30 backdrop-blur-[1px] flex items-center justify-center"
                      >
                        <div className="flex gap-1 items-end h-8">
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ height: ['30%', '100%', '30%'] }}
                              transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-1.5 bg-white rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className={`font-bold text-sm leading-tight mb-1 transition-colors ${playingId === species.code ? 'text-emerald-700' : 'text-stone-800'}`}>
                    {species.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">{species.code}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      playingId === species.code ? 'text-emerald-600' : 'text-stone-400 group-hover:text-emerald-600'
                    }`}>
                      <span className="material-symbols-outlined text-sm" style={playingId === species.code ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {playingId === species.code ? 'stop_circle' : 'play_circle'}
                      </span>
                      {playingId === species.code ? 'Stop' : 'Play'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredSpecies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center py-24"
          >
            <span className="material-symbols-outlined text-5xl text-stone-300 block mb-4">search_off</span>
            <p className="text-lg font-semibold text-stone-500">No species found for "{searchTerm}"</p>
            <p className="text-sm text-stone-400 mt-1">Try a different name or species code.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
