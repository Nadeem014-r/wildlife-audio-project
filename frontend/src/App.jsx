import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Play, Bird, AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

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

  return (
    <div className="app-container">
      <header>
        <Bird size={48} color="#60a5fa" style={{ marginBottom: "1rem" }} />
        <h1>BirdCLEF Predictor</h1>
        <p>Upload a wildlife audio snippet to identify bird species using AI.</p>
      </header>

      <div className="glass-panel">
        <form ref={formRef} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
          <div className={`upload-area ${file ? 'has-file' : ''}`}>
            <input type="file" accept="audio/*,.ogg" onChange={handleChange} />
            <div className="upload-content">
              {file ? (
                <>
                  <FileAudio size={48} className="upload-icon" style={{ animation: 'none' }} />
                  <h3>{file.name}</h3>
                  <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <UploadCloud size={48} className="upload-icon" />
                  <h3>Drag & Drop your audio file here</h3>
                  <p>or click to browse (.ogg preferred)</p>
                </>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
             <button 
               type="button" 
               className="btn-upload" 
               disabled={!file || loading}
               onClick={handleUpload}
             >
               {loading ? 'Analyzing...' : 'Identify Birds'} 
             </button>
             {error && (
               <p style={{ color: '#ef4444', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                 <AlertCircle size={20} /> {error}
               </p>
             )}
          </div>
        </form>
      </div>

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
              {results.predictions.map((pred, idx) => (
                <div key={idx} className="prediction-item">
                  <div className="prediction-header">
                    <span style={{ textTransform: 'capitalize' }}>{pred.species}</span>
                    <span>{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bg">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${pred.confidence * 100}%`, opacity: pred.confidence + 0.2 }}
                    ></div>
                  </div>
                </div>
              ))}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
