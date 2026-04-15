import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

const speciesMap = {
  // Brazilian
  'rubthr1': { name: 'Ruby-throated Bulbul', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Asian_koel.jpg/500px-Asian_koel.jpg' },
  'banana': { name: 'Bananaquit', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Bananaquits.jpg/500px-Bananaquits.jpg' },
  'soulap1': { name: 'Southern Lapwing', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Southern_Lapwing_-_Indaiatuba%2C_SP%2C_BR.jpg/500px-Southern_Lapwing_-_Indaiatuba%2C_SP%2C_BR.jpg' },
  'fepowl': { name: 'Ferruginous Pygmy-Owl', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ferruginous_pygmy_owl_%28Glaucidium_brasilianum_ridgwayi%29_Copan.jpg/500px-Ferruginous_pygmy_owl_%28Glaucidium_brasilianum_ridgwayi%29_Copan.jpg' },
  'houspa': { name: 'House Sparrow', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/House_sparrow_male_in_Prospect_Park_%2853532%29.jpg/500px-House_sparrow_male_in_Prospect_Park_%2853532%29.jpg' },
  'osprey': { name: 'Osprey', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Osprey_Perched_Snag_Heislerville.jpg/500px-Osprey_Perched_Snag_Heislerville.jpg' },
  'coffal1': { name: 'Collared Forest-Falcon', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Micrastur_semitorquatus_%28cropped%29.jpg/500px-Micrastur_semitorquatus_%28cropped%29.jpg' },
  'socfly1': { name: 'Social Flycatcher', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Social_Flycatcher.png/500px-Social_Flycatcher.png' },
  'yeofly1': { name: 'Yellow-olive Flycatcher', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Yellow-bellied_Flycatcher_-_Empidonax_flaviventris.jpg/500px-Yellow-bellied_Flycatcher_-_Empidonax_flaviventris.jpg' },
  'compau': { name: 'Common Pauraque', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Trinidad_and_Tobago_hummingbirds_composite.jpg/500px-Trinidad_and_Tobago_hummingbirds_composite.jpg' },
  'bobfly1': { name: 'Boat-billed Flycatcher', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/NEINEI_%28Megarynchus_pitangua%29.jpg/500px-NEINEI_%28Megarynchus_pitangua%29.jpg' },
  'bncfly': { name: 'Brown-crested Flycatcher', img: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Myiarchus_tyrannulus_1.jpg' },
  'whtdov': { name: 'White-tipped Dove', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/White-tipped_Dove_-_Panama_H8O8470.jpg/500px-White-tipped_Dove_-_Panama_H8O8470.jpg' },
  'trsowl': { name: 'Tropical Screech-Owl', img: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?q=80&w=600&auto=format&fit=crop' },
  'bbwduc': { name: 'Black-bellied Whistling-Duck', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/500px-Anas_platyrhynchos_male_female_quadrat.jpg' },
  // Indian
  'indpea': { name: 'Indian Peafowl', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Peacock_on_tree_%2852077240794%29.jpg/500px-Peacock_on_tree_%2852077240794%29.jpg' },
  'houcro': { name: 'House Crow', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Corvus_splendens.jpg/500px-Corvus_splendens.jpg' },
  'asikoe': { name: 'Asian Koel', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Asian_koel.jpg/500px-Asian_koel.jpg' },
  'revbul': { name: 'Red-vented Bulbul', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Red-vented_bulbul_-_Jamnagar_2023-11-13.jpg/500px-Red-vented_bulbul_-_Jamnagar_2023-11-13.jpg' },
  'commyn': { name: 'Common Myna', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Acridotheres_tristis00.jpg/500px-Acridotheres_tristis00.jpg' },
  'rorpar': { name: 'Rose-ringed Parakeet', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/African_Rose-ringed_Parakeet%2C_Tendaba%2C_Gambia_1.jpg/500px-African_Rose-ringed_Parakeet%2C_Tendaba%2C_Gambia_1.jpg' },
  'comtai': { name: 'Common Tailorbird', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Common_tailorbird_%28Orthotomus_sutorius%29.jpg/500px-Common_tailorbird_%28Orthotomus_sutorius%29.jpg' },
  'ormrob': { name: 'Oriental Magpie-Robin', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Oriental_magpie-robin_%28Copsychus_saularis_ceylonensis%29_male.jpg/500px-Oriental_magpie-robin_%28Copsychus_saularis_ceylonensis%29_male.jpg' },
  'whtkin': { name: 'White-throated Kingfisher', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/White-throated_kingfisher_%28Halcyon_smyrnensis%29_Galle.jpg/500px-White-throated_kingfisher_%28Halcyon_smyrnensis%29_Galle.jpg' },
  'ruftre': { name: 'Rufous Treepie', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Rufous_treepie_%28Dendrocitta_vagabunda_vagabunda%29_Jahalana_pair.jpg/500px-Rufous_treepie_%28Dendrocitta_vagabunda_vagabunda%29_Jahalana_pair.jpg' },
  'bladro': { name: 'Black Drongo', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Bdrongo-Sandeep1.jpg/500px-Bdrongo-Sandeep1.jpg' },
  'copbar': { name: 'Coppersmith Barbet', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Coppersmith_Barbet_%28Megalaima_haemacephala%29_by_Shantanu_Kuveskar.jpg/500px-Coppersmith_Barbet_%28Megalaima_haemacephala%29_by_Shantanu_Kuveskar.jpg' },
  'pursun': { name: 'Purple Sunbird', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Purple_Sunbird_%28Nectarinia_asiatica%29-_Male_%28Breeding%29_on_Kapok_%28Ceiba_pentandra%29_in_Kolkata_I_IMG_1893.jpg/500px-Purple_Sunbird_%28Nectarinia_asiatica%29-_Male_%28Breeding%29_on_Kapok_%28Ceiba_pentandra%29_in_Kolkata_I_IMG_1893.jpg' },
  'rewlap': { name: 'Red-wattled Lapwing', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Red-wattled_lapwing_%28Vanellus_indicus%29_Photograph_by_Shantanu_Kuveskar.jpg/500px-Red-wattled_lapwing_%28Vanellus_indicus%29_Photograph_by_Shantanu_Kuveskar.jpg' },
  'indrob': { name: 'Indian Robin', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Indian_Robin_%28Copsychus_fulicatus%29%2C_Koottanad%2C_Palakkad_district%2C_Kerala_1.jpg/500px-Indian_Robin_%28Copsychus_fulicatus%29%2C_Koottanad%2C_Palakkad_district%2C_Kerala_1.jpg' },
};

const getSpeciesData = (code) =>
  speciesMap[code] || { name: code.replace(/[0-9]/g, '').toUpperCase(), img: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=600&auto=format&fit=crop' };

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

  const topPrediction = !isMock && data.top5_predictions?.length > 0
    ? data.top5_predictions[0]
    : { species: 'indpea', confidence: 0.947 };

  const predictionsArray = !isMock
    ? data.top5_predictions
    : [
        { species: 'indpea', confidence: 0.947 },
        { species: 'houcro', confidence: 0.031 },
        { species: 'asikoe', confidence: 0.014 },
        { species: 'commyn', confidence: 0.005 },
      ];

  const specImage = !isMock
    ? data.spectrogram_image
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXCJwB1cPMOx_9qG9hRtNqVEH0bc9vGyeY96eCjerKqNSN4vpFJhXLt-dqAogxLhj1vUc5jG-sPHsTzYusQ7DKWifXapGjKIAfrG1NO-IcBDhJtzmvXhqViVyUr52efJClov5O9LlzV88-Ohgw-oGF_EVQBeNXAr-78h3dNjsX5WzupUbjYlznaaIn4BcS27Cg_s5geXaJxUhT9QEwPtCxzTbiJ-5nOeB9HV8X764ZfMnSaml4u9PI9SHNgD6HSTYkTIoZtPZjVaQ';

  const topSpeciesInfo = getSpeciesData(topPrediction.species);
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
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e7e5e4'/%3E%3Ctext x='100' y='110' font-size='64' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%A6%85%3C/text%3E%3C/svg%3E";
                  }}
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
                const spInfo = getSpeciesData(pred.species);
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
                  <p className="text-sm font-bold text-stone-800">5.0s</p>
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
