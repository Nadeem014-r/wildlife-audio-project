import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const speciesData = [
  { name: 'Ruby-throated Bulbul', code: 'rubthr1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Asian_koel.jpg/500px-Asian_koel.jpg' },
  { name: 'Bananaquit', code: 'banana', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Bananaquits.jpg/500px-Bananaquits.jpg' },
  { name: 'Southern Lapwing', code: 'soulap1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Southern_Lapwing_-_Indaiatuba%2C_SP%2C_BR.jpg/500px-Southern_Lapwing_-_Indaiatuba%2C_SP%2C_BR.jpg' },
  { name: 'Ferruginous Pygmy-Owl', code: 'fepowl', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ferruginous_pygmy_owl_%28Glaucidium_brasilianum_ridgwayi%29_Copan.jpg/500px-Ferruginous_pygmy_owl_%28Glaucidium_brasilianum_ridgwayi%29_Copan.jpg' },
  { name: 'House Sparrow', code: 'houspa', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/House_sparrow_male_in_Prospect_Park_%2853532%29.jpg/500px-House_sparrow_male_in_Prospect_Park_%2853532%29.jpg' },
  { name: 'Osprey', code: 'osprey', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Osprey_Perched_Snag_Heislerville.jpg/500px-Osprey_Perched_Snag_Heislerville.jpg' },
  { name: 'Collared Forest-Falcon', code: 'coffal1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Micrastur_semitorquatus_%28cropped%29.jpg/500px-Micrastur_semitorquatus_%28cropped%29.jpg' },
  { name: 'Social Flycatcher', code: 'socfly1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Social_Flycatcher.png/500px-Social_Flycatcher.png' },
  { name: 'Yellow-olive Flycatcher', code: 'yeofly1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Yellow-bellied_Flycatcher_-_Empidonax_flaviventris.jpg/500px-Yellow-bellied_Flycatcher_-_Empidonax_flaviventris.jpg' },
  { name: 'Common Pauraque', code: 'compau', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Trinidad_and_Tobago_hummingbirds_composite.jpg/500px-Trinidad_and_Tobago_hummingbirds_composite.jpg' },
  { name: 'Boat-billed Flycatcher', code: 'bobfly1', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/NEINEI_%28Megarynchus_pitangua%29.jpg/500px-NEINEI_%28Megarynchus_pitangua%29.jpg' },
  { name: 'Brown-crested Flycatcher', code: 'bncfly', img: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Myiarchus_tyrannulus_1.jpg' },
  { name: 'White-tipped Dove', code: 'whtdov', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/White-tipped_Dove_-_Panama_H8O8470.jpg/500px-White-tipped_Dove_-_Panama_H8O8470.jpg' },
  { name: 'Tropical Screech-Owl', code: 'trsowl', img: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Black-bellied Whistling-Duck', code: 'bbwduc', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/500px-Anas_platyrhynchos_male_female_quadrat.jpg' },
  { name: 'Blue Jay', code: 'blujay', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Blue_jay_in_PP_%2830960%29.jpg/500px-Blue_jay_in_PP_%2830960%29.jpg' },
  { name: 'Northern Cardinal', code: 'norcar', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Male_northern_cardinal_in_Central_Park_%2852612%29.jpg/500px-Male_northern_cardinal_in_Central_Park_%2852612%29.jpg' },
  { name: 'American Robin', code: 'amrob', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/American_robin_%2871307%29.jpg/500px-American_robin_%2871307%29.jpg' },
  { name: 'European Starling', code: 'eursta', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Toulouse_-_Sturnus_vulgaris_-_2012-02-26_-_3.jpg/500px-Toulouse_-_Sturnus_vulgaris_-_2012-02-26_-_3.jpg' },
  { name: 'Barn Owl', code: 'baowl', img: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=600&auto=format&fit=crop' },
  { name: 'Bald Eagle', code: 'baleag', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/500px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg' },
  { name: 'Mallard', code: 'mallar', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/500px-Anas_platyrhynchos_male_female_quadrat.jpg' },
  { name: 'Hummingbird', code: 'humbir', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Archilochus_colubris_-flying_-male-8.jpg/500px-Archilochus_colubris_-flying_-male-8.jpg' },
  { name: 'Toucan', code: 'toucan', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toucans_%28Ramphastidae%29.jpg/500px-Toucans_%28Ramphastidae%29.jpg' },
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
              {speciesData.length} Supported Bird Species
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
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      playingId !== species.code ? 'grayscale-[30%]' : ''
                    }`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23e7e5e4'/%3E%3Ctext x='100' y='80' font-size='48' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%A6%85%3C/text%3E%3C/svg%3E";
                    }}
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
