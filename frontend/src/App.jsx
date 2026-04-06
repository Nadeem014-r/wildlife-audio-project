import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DetectionResults from './pages/DetectionResults';
import SpeciesGallery from './pages/SpeciesGallery';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  
  // The Results page has its own SideNav, so we might want to hide the Footer there
  // Or handle layout slightly differently, but for now we'll wrap globally.
  const isResultsPage = location.pathname === '/results';

  return (
    <>
      <TopNavBar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<DetectionResults />} />
            <Route path="/gallery" element={<SpeciesGallery />} />
          </Routes>
        </AnimatePresence>
      </div>
      {!isResultsPage && <Footer />}
    </>
  );
}

export default App;
