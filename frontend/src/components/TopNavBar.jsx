import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function TopNavBar() {
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md shadow-[0_40px_60px_-15px_rgba(0,0,0,0.06)] border-b border-[#1f1f1f] font-['Inter'] tracking-tight">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="material-symbols-outlined text-white text-3xl group-hover:text-[#c6c6c6] transition-colors" data-icon="nest_eco_leaf">nest_eco_leaf</span>
          <span className="text-2xl font-black tracking-tighter text-white">ORNIS</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 uppercase text-[0.75rem] font-medium tracking-widest">
          <Link 
            to="/" 
            className={clsx(
              "transition-colors",
              isLinkActive('/') ? "text-white border-b-2 border-white pb-1" : "text-[#c6c6c6] hover:text-white"
            )}
          >
            Identify
          </Link>
          <Link 
            to="/results" 
            className={clsx(
              "transition-colors",
              isLinkActive('/results') ? "text-white border-b-2 border-white pb-1" : "text-[#c6c6c6] hover:text-white"
            )}
          >
            Insights
          </Link>
          <Link 
            to="/gallery" 
            className={clsx(
              "transition-colors",
              isLinkActive('/gallery') ? "text-white border-b-2 border-white pb-1" : "text-[#c6c6c6] hover:text-white"
            )}
          >
            Library
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-[#1f1f1f] transition-all"
          >
            Upload
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-white text-[#0e0e0e] text-sm font-bold hover:bg-[#e2e2e2] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg" data-icon="mic">mic</span>
            Record
          </motion.button>
          <button className="text-white hover:bg-[#1f1f1f] p-2 rounded-full transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
