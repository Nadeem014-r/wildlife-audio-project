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
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-stone-200 font-['Inter'] tracking-tight transition-all">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-white to-stone-50 p-2 rounded-xl shadow-sm border border-stone-200 group-hover:border-emerald-300 transition-all duration-300">
            <span className="material-symbols-outlined text-emerald-800 text-2xl group-hover:text-emerald-500 transition-colors" data-icon="nest_eco_leaf">nest_eco_leaf</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-stone-900 drop-shadow-sm">ORNIS</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 uppercase text-[0.75rem] font-bold tracking-widest leading-none">
          <Link 
            to="/" 
            className={clsx(
              "transition-colors",
              isLinkActive('/') ? "text-emerald-900 border-b-2 border-emerald-900 pb-1" : "text-stone-500 hover:text-stone-900"
            )}
          >
            Identify
          </Link>
          <Link 
            to="/results" 
            className={clsx(
              "transition-colors",
              isLinkActive('/results') ? "text-emerald-900 border-b-2 border-emerald-900 pb-1" : "text-stone-500 hover:text-stone-900"
            )}
          >
            Insights
          </Link>
          <Link 
            to="/gallery" 
            className={clsx(
              "transition-colors",
              isLinkActive('/gallery') ? "text-emerald-900 border-b-2 border-emerald-900 pb-1" : "text-stone-500 hover:text-stone-900"
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
            className="px-6 py-2.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold transition-all shadow-sm"
          >
            Upload
          </motion.button>
          <motion.button 
            onClick={() => navigate('/?action=record')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">mic</span>
            Record
          </motion.button>
          <button className="text-stone-400 hover:text-emerald-700 hover:bg-stone-100 p-2 rounded-full transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
