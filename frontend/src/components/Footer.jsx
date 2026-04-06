import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-[#0e0e0e] w-full border-t border-[#1f1f1f] mt-auto">
      <div className="flex flex-col items-center gap-6 py-12 px-8 w-full max-w-7xl mx-auto font-['Inter']">
        <div className="flex flex-col md:flex-row justify-between w-full gap-8">
          <div className="flex flex-col gap-2 relative">
            <div className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-xl">nest_eco_leaf</span>
                ORNIS
            </div>
            <p className="font-['Inter'] text-xs text-[#c6c6c6]">
                Powered by EfficientNet-B0 + HNR Fusion | ORNIS 2026
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8 text-xs text-[#c6c6c6] tracking-widest uppercase font-medium">
            <a href="#" className="hover:text-white transition-colors opacity-80 hover:opacity-100">Privacy</a>
            <a href="#" className="hover:text-white transition-colors opacity-80 hover:opacity-100">Terms</a>
            <a href="#" className="hover:text-white transition-colors opacity-80 hover:opacity-100">Research Data</a>
            <a href="#" className="hover:text-white transition-colors opacity-80 hover:opacity-100">Contact</a>
          </div>
        </div>
        
        <div className="w-full flex items-center justify-between mt-4">
            <div className="h-[1px] w-12 bg-[#1f1f1f]"></div>
            <p className="text-[10px] text-[#c6c6c6]/50 tracking-widest uppercase ml-4">
                © 2026 Ornis Editorial. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
