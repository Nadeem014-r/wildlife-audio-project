import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock bird audio URL from Wikimedia Commons for demonstration
const mockAudioUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bird_song_2.ogg';

const speciesData = [
  { name: 'Ruby-throated Bulbul', code: 'rubthr1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpy9JlAVXqlwuzW3_-BIuL70qa3rOn4nuyfUou35Aw-RYf-x1bsKt0GLt2c4yB2t-_y63xgsLqBh6TMC5pXSVqoQukMmqKqSgZVvR9O1JUu-aQY3VVbV3AbsW7kHPqDMD0EsiO1OXJY7ua7_xINQb5L12RIk0NbssHPH8eowaXo9U5RNRitqv6jzOX_F2mQJPO98M_qcRLZxnwWDG11rMLel3uwKIKLHAhmUSssXDVRmShNsmNjpVXXxy9rePxTdknsCl6Zk9JjIo', audioUrl: mockAudioUrl },
  { name: 'Bananaquit', code: 'banana', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8ARkHV6hUhpGYEyrVD-HBWQkQwr0U2XMpxGY0yy0vjKd_4doWrjyGAcdGK64suJYmIhtmHal8skLakaijOrYQWjQmAIBRIR-aLCxLBix2w-9t-70X__BGWpuEOoc2S4qAkQR1o6WzLwn9sc6Q6sT6vjnO9s6cPWnF3CaZrV-C26rCbA90o-9IKKYL_IdxI3T9oz6atwewV9E9cRI2H_cGV0EoZz42e9pdqrsLdu4IoIQKavBMUDHtffazQabc06YQ43wCoJiR6o', audioUrl: mockAudioUrl },
  { name: 'Southern Lapwing', code: 'soulap1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvaDcP4vhG_nd7UmMCr9sG148ldpUhg-vKWgj6H6d4Jy1aMRD2TX1pDUHML7t7ecp6hjhTaZ1e97YB9267mZZ5ACboIf1XnJd0CDy-hrvtqU330OFeL8YDDM-ypHRAPcU1dig14KPgq72eN05ScHZBFqUl_70FvrrKW7q6fubaoc06QVkcEszWll4EZX3QnyYubREEc5nr7uY_U-2MiILrtDRQHWfhaCwz2wnm5bLtiRzJcCjt81Tc6E3dhNrE2sEgXp0KwSPq6fI', audioUrl: mockAudioUrl },
  { name: 'Ferruginous Pygmy-Owl', code: 'fepowl', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'House Sparrow', code: 'houspa', img: 'https://images.unsplash.com/photo-1549474706-03c004cdece2?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Osprey', code: 'osprey', img: 'https://images.unsplash.com/photo-1596700810769-af7b79140aa9?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Collared Forest-Falcon', code: 'coffal1', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Social Flycatcher', code: 'socfly1', img: 'https://images.unsplash.com/photo-1520108846386-a21edde7ffbb?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Yellow-olive Flycatcher', code: 'yeofly1', img: 'https://images.unsplash.com/photo-1518063073995-1f8d48db36de?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Common Pauraque', code: 'compau', img: 'https://images.unsplash.com/photo-1620694119932-bb9f1df41ee6?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Boat-billed Flycatcher', code: 'bobfly1', img: 'https://images.unsplash.com/photo-1550259508-2e0618ff7e42?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Brown-crested Flycatcher', code: 'bncfly', img: 'https://images.unsplash.com/photo-1534063261622-6b943d671cde?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'White-tipped Dove', code: 'whtdov', img: 'https://images.unsplash.com/photo-1454044569420-1a221f7ed248?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Tropical Screech-Owl', code: 'trsowl', img: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Black-bellied Whistling-Duck', code: 'bbwduc', img: 'https://images.unsplash.com/photo-1549472304-4aff513aedbb?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Blue Jay', code: 'blujay', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Northern Cardinal', code: 'norcar', img: 'https://images.unsplash.com/photo-1510006764491-d8a4369a2503?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'American Robin', code: 'amrob', img: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'European Starling', code: 'eursta', img: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Barn Owl', code: 'baowl', img: 'https://images.unsplash.com/photo-1516246340243-d2d88fae498c?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Bald Eagle', code: 'baleag', img: 'https://images.unsplash.com/photo-1501602715617-64906ec1459a?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Mallard', code: 'mallar', img: 'https://images.unsplash.com/photo-1528659556277-24a91f531d04?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Penguin', code: 'pengui', img: 'https://images.unsplash.com/photo-1550927357-1941ea6ca153?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Hummingbird', code: 'humbir', img: 'https://images.unsplash.com/photo-1507202758117-62f3a6cf544b?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
  { name: 'Toucan', code: 'toucan', img: 'https://images.unsplash.com/photo-1552596417-6d63d0c410ba?q=80&w=600&auto=format&fit=crop', audioUrl: mockAudioUrl },
];

export default function SpeciesGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio element just once
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlayingId(null);
    }
  }, []);

  const toggleAudio = (species) => {
    if (playingId === species.code) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = species.audioUrl;
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      setPlayingId(species.code);
    }
  };

  const filteredSpecies = speciesData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight uppercase relative">
                <span className="relative z-10">Supported</span> <span className="text-[#c6c6c6] relative z-10">Bird Species</span>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
            </h1>
            <p className="text-[#c6c6c6] text-lg max-w-2xl font-light">
                {speciesData.length} species from the ORNIS dataset currently optimized for our nocturnal detection engine. Click exactly on the species to play their acoustic footprint.
            </p>
          </div>
          
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c6c6c6] group-focus-within:text-white transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search species..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1f1f1f] border border-[#333] rounded-full py-3 pl-12 pr-6 text-sm focus:ring-1 focus:ring-white focus:border-white w-full md:w-72 text-white placeholder:text-[#666] outline-none shadow-xl transition-all"
            />
          </div>
        </motion.div>

        {/* Species Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredSpecies.map((species) => (
              <motion.div 
                key={species.code}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
                className="obsidian-card rounded-xl p-5 flex flex-col group relative overflow-hidden cursor-pointer"
                onClick={() => toggleAudio(species)}
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="aspect-square rounded-lg mb-4 overflow-hidden relative bg-[#0e0e0e] border border-[#1f1f1f]">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={species.img} 
                    alt={species.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  
                  {/* Playing Indicator */}
                  <AnimatePresence>
                    {playingId === species.code && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
                      >
                         <div className="flex gap-1 items-end h-10 w-10">
                            {[0, 1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-2 bg-white rounded-t-sm"
                                    animate={{ height: ["20%", "100%", "20%"] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                ></motion.div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h3 className="font-bold text-lg leading-tight text-white mb-1 uppercase tracking-tight">{species.name}</h3>
                <span className="font-mono text-[10px] text-[#c6c6c6] mb-6 tracking-widest uppercase">{species.code}</span>
                
                <button 
                  className={`mt-auto btn-obsidian py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${playingId === species.code ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm" style={playingId === species.code ? {fontVariationSettings: "'FILL' 1"} : {}}>
                    {playingId === species.code ? 'stop_circle' : 'play_circle'}
                  </span>
                  {playingId === species.code ? 'Listening...' : 'Play Call'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSpecies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full text-center py-20 text-[#c6c6c6]"
          >
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
            <p className="text-xl font-medium">No species found matching "{searchTerm}"</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
