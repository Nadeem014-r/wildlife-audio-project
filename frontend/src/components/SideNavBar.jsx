import React from 'react';
import { motion } from 'framer-motion';

export default function SideNavBar() {
  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] sticky top-20 left-0 bg-[#0e0e0e] w-64 py-8 pr-4 font-['Inter'] text-sm tracking-widest uppercase z-10">
      <div className="flex items-center gap-3 mb-10 px-6">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#131313] border border-[#1f1f1f]">
          <img 
            src="https://images.unsplash.com/photo-1542315024-e4af7846985a?q=80&w=200&auto=format&fit=crop" 
            alt="User Profile Avatar" 
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div>
          <p className="font-black text-white normal-case tracking-normal">Birder Pro</p>
          <p className="text-[10px] text-[#c6c6c6] normal-case">Expert Level</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <a href="#" className="flex items-center gap-4 px-6 py-3 text-[#c6c6c6] hover:bg-[#131313] rounded-r-full transition-all active:translate-x-1 duration-150">
          <span className="material-symbols-outlined" data-icon="dynamic_feed">dynamic_feed</span>
          <span>Feed</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-6 py-3 bg-[#1f1f1f] text-white rounded-r-full font-bold shadow-[4px_0_10px_rgba(255,255,255,0.05)] transition-all">
          <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
          <span>Sightings</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-6 py-3 text-[#c6c6c6] hover:bg-[#131313] rounded-r-full transition-all active:translate-x-1 duration-150">
          <span className="material-symbols-outlined" data-icon="map">map</span>
          <span>Map</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-6 py-3 text-[#c6c6c6] hover:bg-[#131313] rounded-r-full transition-all active:translate-x-1 duration-150">
          <span className="material-symbols-outlined" data-icon="menu_book">menu_book</span>
          <span>Field Guide</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-6 py-3 text-[#c6c6c6] hover:bg-[#131313] rounded-r-full transition-all active:translate-x-1 duration-150">
          <span className="material-symbols-outlined" data-icon="groups">groups</span>
          <span>Community</span>
        </a>
      </div>
      
      <div className="mt-auto px-6 space-y-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-white text-black rounded-lg font-black flex items-center justify-center gap-2 hover:bg-[#e2e2e2] transition-colors text-[11px]"
        >
          <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
          LOG NEW SIGHTING
        </motion.button>
        
        <div className="pt-6 border-t border-[#1f1f1f] space-y-2">
          <a href="#" className="flex items-center gap-4 py-2 text-[#c6c6c6] hover:text-white transition-colors text-[11px]">
            <span className="material-symbols-outlined text-sm" data-icon="settings">settings</span>
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center gap-4 py-2 text-[#c6c6c6] hover:text-white transition-colors text-[11px]">
            <span className="material-symbols-outlined text-sm" data-icon="help_outline">help_outline</span>
            <span>Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
