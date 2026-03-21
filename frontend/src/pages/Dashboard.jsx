import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, History, LogOut, Activity, Zap, Clock, Cpu, Search, Sun, Moon 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  };

  const user = JSON.parse(localStorage.getItem('user_data')) || { name: 'Verified User', email: 'guest' };

  useEffect(() => {
    const savedUserData = JSON.parse(localStorage.getItem('user_data'));
    if (savedUserData && savedUserData.history) {
      setHistory(savedUserData.history);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!jobText) {
      return alert("⚠️ Please provide job description text.");
    }
    
    setIsAnalyzing(true);
    setShowResults(false);
    setAnalysisPhase('INITIALIZING SCAN...');
    
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: jobText, email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("⚠️ " + (data.detail || "Analysis failed. Please try again."));
        setIsAnalyzing(false);
        return;
      }
      
      setTimeout(() => setAnalysisPhase('NEURAL FILTERING...'), 200);
      setTimeout(() => setAnalysisPhase('COMPILING RESULTS...'), 1000);
      
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
        setShowResults(true);

        if (data.history) {
          setHistory(data.history);
          localStorage.setItem('user_data', JSON.stringify({ ...user, history: data.history }));
        }
      }, 1500);
    } catch (error) {
      alert("System Offline: " + error.message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`dashboard-root ${theme}-theme`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        /* Theme Logic */
        .dark-theme {
          --bg-root: #05070A;
          --bg-card: #0d1117;
          --text-main: #f0f6fc;
          --text-muted: #8b949e;
          --border-color: #30363d;
          --input-bg: transparent;
          --card-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .light-theme {
          --bg-root: #f4f7fa;
          --bg-card: #ffffff;
          --text-main: #1a1d21;
          --text-muted: #626d79;
          --border-color: #d0d7de;
          --input-bg: #f8f9fa;
          --card-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .dashboard-root { 
          min-height: 100vh; width: 100vw; background: var(--bg-root); color: var(--text-main);
          font-family: 'Plus Jakarta Sans', sans-serif; padding: 1.5rem; box-sizing: border-box;
          overflow-x: hidden; transition: background 0.3s ease;
        }

        .main-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; max-width: 1600px; margin: 0 auto; }

        .sidebar { 
          background: var(--bg-card); border: 1px solid var(--border-color); 
          border-radius: 24px; padding: 2rem; height: calc(100vh - 3rem); 
          position: sticky; top: 1.5rem; display: flex; flex-direction: column; 
        }

        /* Small Icon Theme Toggle */
        .theme-selector {
          display: flex; gap: 8px; background: rgba(88, 166, 255, 0.08);
          padding: 6px; border-radius: 12px; margin-bottom: 2rem; width: fit-content;
        }

        .theme-icon-btn {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; background: transparent;
          color: var(--text-muted);
        }

        .theme-icon-btn.active {
          background: #58a6ff; color: white; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.4);
        }

        .user-highlight {
          margin-top: auto; padding: 1.2rem; background: rgba(88, 166, 255, 0.05);
          border-radius: 20px; border: 1px solid rgba(88, 166, 255, 0.2);
        }

        .logout-btn {
          width: 100%; margin-top: 1rem; padding: 0.8rem; border-radius: 12px;
          background: #f85149; color: white; border: none; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s;
        }

        .analysis-card {
          background: var(--bg-card); border: 1px solid var(--border-color); 
          border-radius: 32px; padding: 2rem; position: relative; overflow: hidden;
          box-shadow: var(--card-shadow);
        }

        .scanner-container {
          position: relative; height: 300px; background: rgba(0,0,0,0.1);
          border-radius: 20px; border: 1px dashed var(--border-color); overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        .laser-line {
          position: absolute; width: 100%; height: 4px; background: #58a6ff;
          box-shadow: 0 0 20px 2px #58a6ff; top: 0; left: 0; z-index: 10;
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .grid-bg {
          position: absolute; width: 100%; height: 100%;
          background-image: linear-gradient(rgba(88, 166, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(88, 166, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .bulb { width: 14px; height: 14px; border-radius: 50%; display: inline-block; transition: 0.5s; background: #30363d; }
        .bulb-red.active { background: #f85149; box-shadow: 0 0 25px 8px rgba(248, 81, 73, 0.7); border: 2px solid #fff; }
        .bulb-green.active { background: #10b981; box-shadow: 0 0 25px 8px rgba(16, 185, 129, 0.7); border: 2px solid #fff; }

        .input-area { 
          width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); 
          border-radius: 18px; color: var(--text-main); padding: 1.5rem; resize: none; min-height: 250px; outline: none;
        }

        .model-row { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 10px 15px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 8px;
        }

        .history-item { 
          background: var(--bg-card); padding: 1.2rem; border-radius: 16px; 
          display: grid; grid-template-columns: 30px 1fr 100px 140px; align-items: center; gap: 15px;
          border: 1px solid var(--border-color); margin-top: 10px;
        }
        
        .pulse-bulb { width: 10px; height: 10px; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } }

        .char-counter {
          font-size: 0.7rem; font-weight: 700; margin-top: 8px;
          text-align: right; transition: color 0.3s;
        }
      `}</style>

      <div className="main-layout">
        <aside className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <ShieldCheck size={32} color="#10b981" />
            <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>JOB DETECTOR</h1>
          </div>

          {/* Small Icon Theme Toggle */}
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.8rem', letterSpacing: '2px' }}>
            THEME MODE
          </div>
          <div className="theme-selector">
            <button 
              className={`theme-icon-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => toggleTheme('light')}
            >
              <Sun size={16} />
            </button>
            <button 
              className={`theme-icon-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => toggleTheme('dark')}
            >
              <Moon size={16} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '2px' }}>
              ACTIVE MODELS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#58a6ff' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>SVM Kernel</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Naive Bayes</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f1e05a' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Logistic Regression</span>
              </div>
            </div>
          </div>

          <div className="user-highlight">
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user.name}</div>
            <button onClick={() => navigate('/')} className="logout-btn"><LogOut size={16} /> Logout</button>
          </div>
        </aside>

        <main>
          <header style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Fake Job And Internship Advertisement Detection</h2>
            <p style={{ color: 'var(--text-muted)' }}>HYBRID MODEL</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* INPUT SECTION */}
            <div className="analysis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 800, color: '#58a6ff', fontSize: '0.8rem' }}> INPUT ADVERTISEMENT</span>
                <Cpu size={16} color="#58a6ff" />
              </div>
              <textarea 
                className="input-area" 
                placeholder="Paste job description here to begin scan..." 
                value={jobText} 
                onChange={(e) => setJobText(e.target.value)} 
              />
              <div className="char-counter" style={{ color: 'var(--text-muted)' }}>
                {jobText.length} characters detected
              </div>
              <button 
                className="logout-btn" 
                style={{ background: '#10b981', padding: '1.2rem', marginTop: '1.5rem', fontSize: '1.1rem' }} 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "SCANNING IN PROGRESS..." : "ANALYSIS ADS"}
              </button>
            </div>

            {/* RESULTS SCANNER SECTION */}
            <div className="analysis-card" style={{ border: '2px solid #58a6ff' }}>
              <div className="grid-bg"></div>
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <div className="scanner-container">
                    <div className="laser-line"></div>
                    <Activity size={50} color="#58a6ff" />
                    <p style={{ marginTop: '20px', fontWeight: 800, letterSpacing: '2px', color: '#58a6ff' }}>{analysisPhase}</p>
                  </div>
                ) : showResults && result ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div className={`bulb bulb-green ${result.result_label === 'GENUINE' ? 'active' : ''}`} />
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '4px' }}>REAL</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className={`bulb bulb-red ${result.result_label === 'FAKE' ? 'active' : ''}`} />
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '4px' }}>FAKE</div>
                      </div>
                    </div>

                    <h1 style={{ 
                      textAlign: 'center', 
                      fontSize: result.result_label === 'INVALID' ? '2.5rem' : '4rem', 
                      margin: '0', 
                      color: result.result_label === 'INVALID' ? '#6c757d' : (result.result_label === 'FAKE' ? '#f85149' : '#10b981'),
                      textShadow: result.result_label === 'INVALID' ? 'none' : `0 0 20px ${result.result_label === 'FAKE' ? '#f8514955' : '#10b98155'}`
                    }}>
                      {result.result_label}
                    </h1>

                    <div style={{ 
                      textAlign: 'center', 
                      background: 'rgba(88, 166, 255, 0.05)', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      margin: '15px 0',
                      border: result.result_label === 'INVALID' ? '1px solid #f85149' : 'none'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: result.result_label === 'INVALID' ? '#f85149' : '#58a6ff', fontWeight: 800 }}>
                        {result.result_label === 'INVALID' ? result.battle_data.Status : `CONFIDENCE SCORE: ${result.confidence}%`}
                      </span>
                    </div>

                    {result.result_label !== 'INVALID' && (
                      <div style={{ marginTop: '20px' }}>
                        <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SVM (Kernel)</span>
                          <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                            <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>● {result.battle_data?.["SVM (Kernel)"]}% FAKE</span>
                            <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>● {(100 - result.battle_data?.["SVM (Kernel)"]).toFixed(1)}% REAL</span>
                          </div>
                        </div>

                        <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Naive Bayes</span>
                          <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                            <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>● {result.battle_data?.["Naive Bayes"]}% FAKE</span>
                            <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>● {(100 - result.battle_data?.["Naive Bayes"]).toFixed(1)}% REAL</span>
                          </div>
                        </div>

                        <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Logistic Regression</span>
                          <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                            <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>● {result.battle_data?.["Logistic Regression"]}% FAKE</span>
                            <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>● {(100 - result.battle_data?.["Logistic Regression"]).toFixed(1)}% REAL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="scanner-container">
                    <Search size={40} style={{ opacity: 0.2 }} />
                    <p style={{ opacity: 0.2, fontWeight: 800 }}> AWAITING INPUT</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* HISTORY SECTION */}
          <div style={{ marginTop: '4rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, letterSpacing: '1px' }}>
                <History size={22} color="#58a6ff" /> SYSTEM HISTORY
              </h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL SCANS: {history.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, var(--border-color), transparent)' }} />
              {history.length > 0 ? [...history].reverse().map((h, i) => {
                const isFake = h.result.includes('FAKE');
                const isInvalid = h.result === 'INVALID';
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 2 }}>
                    <div style={{ marginTop: '15px' }}>
                      <div className="pulse-bulb" style={{ 
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: isInvalid ? '#6c757d' : (isFake ? '#f85149' : '#10b981'),
                        boxShadow: `0 0 20px 5px ${isInvalid ? 'rgba(108,117,125,0.2)' : (isFake ? 'rgba(248, 81, 73, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`,
                        border: '2px solid #fff'
                      }} />
                    </div>
                    <div style={{ 
                      flex: 1, background: 'var(--bg-card)', border: `1px solid ${isFake ? 'rgba(248, 81, 73, 0.2)' : 'var(--border-color)'}`, 
                      borderRadius: '16px', padding: '1.2rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: isInvalid ? '#6c757d' : (isFake ? '#f85149' : '#10b981'), letterSpacing: '2px' }}>
                          ● {h.result}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          <Clock size={12} /> {h.timestamp}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                        "{h.description?.substring(0, 120)}..."
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '24px' }}>
                  <Search size={30} style={{ opacity: 0.2, marginBottom: '10px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No system history found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Dashboard;