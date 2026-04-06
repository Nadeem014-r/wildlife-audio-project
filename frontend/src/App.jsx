<<<<<<< HEAD
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DetectionResults from './pages/DetectionResults';
import SpeciesGallery from './pages/SpeciesGallery';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
=======
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileAudio, Play, Bird, AlertCircle } from 'lucide-react';
import './index.css';
>>>>>>> 2129123ca5bbc5599f6b545eacc8074509959f2c

const BIRD_NAMES = {
  'rubthr1': 'Ruby-throated Bulbul',
  'banana': 'Bananaquit',
  'soulap1': 'Southern Lapwing',
  'fepowl': 'Ferruginous Pygmy-Owl',
  'houspa': 'House Sparrow',
  'osprey': 'Osprey',
  'coffal1': 'Collared Forest-Falcon',
  'socfly1': 'Social Flycatcher',
  'yeofly1': 'Yellow-olive Flycatcher',
  'compau': 'Common Pauraque',
  'bobfly1': 'Boat-billed Flycatcher',
  'bncfly': 'Brown-crested Flycatcher',
  'whtdov': 'White-tipped Dove',
  'trsowl': 'Tropical Screech-Owl',
  'bbwduc': 'Black-bellied Whistling-Duck'
};

const WIKI_TITLES = {
  'rubthr1': 'Ruby-throated_bulbul',
  'banana': 'Bananaquit',
  'soulap1': 'Southern_lapwing',
  'fepowl': 'Ferruginous_pygmy_owl',
  'houspa': 'House_sparrow',
  'osprey': 'Osprey',
  'coffal1': 'Collared_forest_falcon',
  'socfly1': 'Social_flycatcher',
  'yeofly1': 'Yellow-olive_flatbill',
  'compau': 'Common_pauraque',
  'bobfly1': 'Boat-billed_flycatcher',
  'bncfly': 'Brown-crested_flycatcher',
  'whtdov': 'White-tipped_dove',
  'trsowl': 'Tropical_screech_owl',
  'bbwduc': 'Black-bellied_whistling_duck'
};
function App() {
<<<<<<< HEAD
  const location = useLocation();
  
  // The Results page has its own SideNav, so we might want to hide the Footer there
  // Or handle layout slightly differently, but for now we'll wrap globally.
  const isResultsPage = location.pathname === '/results';
=======
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [wikiInfo, setWikiInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (results && results.predictions && results.predictions.length > 0) {
      const topPredId = results.predictions[0].species;
      const wikiTitle = WIKI_TITLES[topPredId];
      if (wikiTitle) {
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`)
          .then(res => res.json())
          .then(data => {
            setWikiInfo({
              title: data.title,
              extract: data.extract,
              image: data.thumbnail?.source,
              url: data.content_urls?.desktop?.page
            });
          })
          .catch(err => console.error("Wikipedia fetch error", err));
      }
    } else {
      setWikiInfo(null);
    }
  }, [results]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setError(null);
    setResults(null);
    if (!selectedFile.type.includes('audio/') && !selectedFile.name.endsWith('.ogg')) {
      setError("Please select a valid audio file (.ogg, .mp3, .wav)");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Local dev config. Ensure Python backend is running on 8000!
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setResults(data);
      } else {
        setError(data.message || "Failed to analyze audio");
      }
    } catch (err) {
      setError("Cannot connect to server. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  };
>>>>>>> 2129123ca5bbc5599f6b545eacc8074509959f2c

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
<<<<<<< HEAD
      {!isResultsPage && <Footer />}
    </>
=======

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Running Deep Neural Network Inference...</p>
        </div>
      )}

      {results && !loading && (
        <div className="glass-panel">
          <div className="results-grid">
            <div className="predictions-list">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={24} /> Top Matches
              </h2>
              {results.predictions.map((pred, idx) => {
                const displayName = BIRD_NAMES[pred.species] || pred.species;
                return (
                <div key={idx} className="prediction-item">
                  <div className="prediction-header">
                    <span style={{ textTransform: 'capitalize' }}>{displayName}</span>
                    <span>{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bg">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${pred.confidence * 100}%`, opacity: pred.confidence + 0.2 }}
                    ></div>
                  </div>
                </div>
              )})}
            </div>
            
            <div className="spectrogram-container">
              <h2 style={{ marginBottom: '1.5rem' }}>Audio Spectrogram</h2>
              {results.spectrogram_image ? (
                <img 
                  src={results.spectrogram_image} 
                  alt="Mel Spectrogram" 
                  className="spectrogram-img"
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  No Spectrogram Available
                </div>
              )}
            </div>

            {wikiInfo && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {wikiInfo.image && (
                  <img 
                    src={wikiInfo.image} 
                    alt={wikiInfo.title} 
                    style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} 
                  />
                )}
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                    <Bird size={24} /> {wikiInfo.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem', fontSize: '1rem' }}>
                    {wikiInfo.extract}
                  </p>
                  <a href={wikiInfo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}>
                    Read more on Wikipedia &rarr;
                  </a>
                </div>
              </div>
            )}
            
            {location && (
              <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📍 Capture Location
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Audio captured at coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
                <iframe 
                  width="100%" 
                  height="300" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.05},${location.lat - 0.05},${location.lng + 0.05},${location.lat + 0.05}&layer=mapnik&marker=${location.lat},${location.lng}`} 
                  style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
>>>>>>> 2129123ca5bbc5599f6b545eacc8074509959f2c
  );
}

export default App;
