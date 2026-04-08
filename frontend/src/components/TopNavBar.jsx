import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/[0.05] font-['Inter'] tracking-tight transition-all">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-[#2D2D2D] to-[#121212] p-2 rounded-xl shadow-inner border border-white/5 group-hover:border-white/20 transition-all duration-300">
            <span className="material-symbols-outlined text-white text-2xl group-hover:text-emerald-400 transition-colors" data-icon="nest_eco_leaf">nest_eco_leaf</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">ORNIS</span>
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
            onClick={() => navigate('/?action=upload')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)] backdrop-blur-sm"
          >
            Upload
          </motion.button>
          <motion.button 
            onClick={() => navigate('/?action=record')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#0A0A0A] text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">mic</span>
            Record
          </motion.button>
          <button className="text-[#888] hover:text-white hover:bg-white/10 p-2 rounded-full transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
