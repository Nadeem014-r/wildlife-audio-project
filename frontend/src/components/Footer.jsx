import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white w-full border-t border-stone-100 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 px-8 w-full max-w-5xl mx-auto font-['Inter']">
        <div className="flex items-center gap-2 text-stone-700">
          <span className="material-symbols-outlined text-emerald-600 text-xl">nest_eco_leaf</span>
          <span className="font-black text-stone-900 tracking-tight">ORNIS</span>
          <span className="text-stone-300 mx-1">·</span>
          <span className="text-xs text-stone-400">Powered by EfficientNet-B0 + HNR Fusion</span>
        </div>
        
        <div className="flex gap-6 text-xs text-stone-400 tracking-wide">
          <a href="#" className="hover:text-emerald-700 transition-colors">Privacy</a>
          <a href="#" className="hover:text-emerald-700 transition-colors">Terms</a>
          <a href="#" className="hover:text-emerald-700 transition-colors">Contact</a>
        </div>

        <p className="text-xs text-stone-400">
          © 2026 ORNIS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
