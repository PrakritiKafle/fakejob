import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, History, LogOut, Activity, Zap, Clock, Cpu, Search
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const user = JSON.parse(localStorage.getItem('user_data')) || { name: 'Verified User', email: 'guest' };

  useEffect(() => {
    const savedUserData = JSON.parse(localStorage.getItem('user_data'));
    if (savedUserData && savedUserData.history) {
      setHistory(savedUserData.history);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!jobText || jobText.length < 20) return alert("Please provide more text for the scan.");
    
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
      
      setTimeout(() => setAnalysisPhase('NEURAL FILTERING...'), 800);
      setTimeout(() => setAnalysisPhase('COMPILING RESULTS...'), 1600);
      
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
        setShowResults(true);

        if (data.history) {
          setHistory(data.history);
          localStorage.setItem('user_data', JSON.stringify({ ...user, history: data.history }));
        }
      }, 2500);
    } catch (error) {
      alert("System Offline: " + error.message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        .dashboard-root { 
          min-height: 100vh; width: 100vw; background: #05070A; color: #f0f6fc;
          font-family: 'Plus Jakarta Sans', sans-serif; padding: 1.5rem; box-sizing: border-box;
          overflow-x: hidden;
        }

        .main-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; max-width: 1600px; margin: 0 auto; }

        .sidebar { 
          background: #0d1117; border: 1px solid rgba(255, 255, 255, 0.05); 
          border-radius: 24px; padding: 2rem; height: calc(100vh - 3rem); 
          position: sticky; top: 1.5rem; display: flex; flex-direction: column; 
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

        /* --- THE SCANNER ATTRACTION --- */
        .analysis-card {
          background: #0d1117; border: 1px solid #30363d; 
          border-radius: 32px; padding: 2rem; position: relative; overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .scanner-container {
          position: relative; height: 300px; background: rgba(0,0,0,0.3);
          border-radius: 20px; border: 1px dashed #30363d; overflow: hidden;
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

        .bulb { width: 14px; height: 14px; border-radius: 50%; display: inline-block; transition: 0.5s; }
        .bulb-red.active { background: #f85149; box-shadow: 0 0 25px 8px rgba(248, 81, 73, 0.7); border: 2px solid #fff; }
        .bulb-green.active { background: #10b981; box-shadow: 0 0 25px 8px rgba(16, 185, 129, 0.7); border: 2px solid #fff; }

        .input-area { 
          width: 100%; background: transparent; border: 1px solid #30363d; 
          border-radius: 18px; color: #fff; padding: 1.5rem; resize: none; min-height: 250px; outline: none;
        }

        .model-row { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 10px 15px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 8px;
        }

        .history-item { 
          background: #0d1117; padding: 1.2rem; border-radius: 16px; 
          display: grid; grid-template-columns: 30px 1fr 100px 140px; align-items: center; gap: 15px;
          border: 1px solid #30363d; margin-top: 10px;
        }
        
        .pulse-bulb { width: 10px; height: 10px; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } }
      `}</style>

      <div className="main-layout">
        <aside className="sidebar">
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
    <ShieldCheck size={32} color="#10b981" />
    <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>JOB CHECKER</h1>
  </div>

  <div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.6rem', color: '#8b949e', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '2px' }}>
      ACTIVE ENGINES
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#58a6ff' }}></div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>SVM Kernel</span>
      </div>

      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Naive Bayes</span>
      </div>

      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f1e05a' }}></div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Logistic Regression</span>
      </div>
    </div>
  </div>

  <div className="user-highlight">
    <div style={{ fontSize: '0.6rem', color: '#58a6ff', fontWeight: 800 }}>AGENT STATUS: ACTIVE</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user.name}</div>
    <button onClick={() => navigate('/')} className="logout-btn"><LogOut size={16} /> Exit System</button>
  </div>
</aside>

        <main>
          <header style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Fake Job And Internship Detection</h2>
            <p style={{ color: '#8b949e' }}>HYBRID MODEL</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* INPUT SECTION */}
            <div className="analysis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 800, color: '#58a6ff', fontSize: '0.8rem' }}>DATA INPUT TERMINAL</span>
                <Cpu size={16} color="#58a6ff" />
              </div>
              <textarea 
                className="input-area" 
                placeholder="Paste job description here to begin scan..." 
                value={jobText} 
                onChange={(e) => setJobText(e.target.value)} 
              />
              <button 
                className="logout-btn" 
                style={{ background: '#10b981', padding: '1.2rem', marginTop: '1.5rem', fontSize: '1.1rem' }} 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "SCANNING IN PROGRESS..." : "ANALYSIS ADS"}
              </button>
            </div>

            {/* ATTRACTION SCANNER SECTION */}
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
                        <div className={`bulb bulb-green ${!result.final_decision.includes('FAKE') ? 'active' : ''}`} />
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '4px' }}>REAL</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className={`bulb bulb-red ${result.final_decision.includes('FAKE') ? 'active' : ''}`} />
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '4px' }}>FAKE</div>
                      </div>
                    </div>

                    <h1 style={{ 
                      textAlign: 'center', fontSize: '4rem', margin: '0', 
                      color: result.final_decision.includes('FAKE') ? '#f85149' : '#10b981',
                      textShadow: `0 0 20px ${result.final_decision.includes('FAKE') ? '#f8514955' : '#10b98155'}`
                    }}>
                      {result.final_decision.split(' ')[1]}
                    </h1>

                    <div style={{ textAlign: 'center', background: 'rgba(88,166,255,0.1)', padding: '10px', borderRadius: '10px', margin: '15px 0' }}>
                      <span style={{ fontSize: '0.9rem', color: '#58a6ff', fontWeight: 800 }}>CONFIDENCE SCORE: {result.confidence}%</span>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      {/* SVM ROW */}
                      <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b949e' }}>SVM (Kernel)</span>
                        <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                          <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {result.battle_data?.["SVM (Kernel)"]}% FAKE
                          </span>
                          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {(100 - result.battle_data?.["SVM (Kernel)"]).toFixed(1)}% REAL
                          </span>
                        </div>
                      </div>

                      {/* NAIVE BAYES ROW */}
                      <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b949e' }}>Naive Bayes</span>
                        <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                          <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {result.battle_data?.["Naive Bayes"]}% FAKE
                          </span>
                          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {(100 - result.battle_data?.["Naive Bayes"]).toFixed(1)}% REAL
                          </span>
                        </div>
                      </div>

                      {/* LOGISTIC REGRESSION ROW */}
                      <div className="model-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b949e' }}>Logistic Regression</span>
                        <div style={{ display: 'flex', width: '100%', gap: '15px' }}>
                          <span style={{ color: '#f85149', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {result.battle_data?.["Logistic Regression"]}% FAKE
                          </span>
                          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                             ● {(100 - result.battle_data?.["Logistic Regression"]).toFixed(1)}% REAL
                          </span>
                        </div>
                      </div>
                    </div>
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
        {/* ENHANCED LOG HISTORY: LIVE FEED LAYOUT */}
          <div style={{ marginTop: '4rem', position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '2rem',
              borderBottom: '1px solid #30363d',
              paddingBottom: '1rem'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, letterSpacing: '1px' }}>
                <History size={22} color="#58a6ff" /> SYSTEM LOG HISTORY
              </h3>
              <span style={{ fontSize: '0.65rem', color: '#8b949e', fontWeight: 800 }}>
                TOTAL SCANS: {history.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
              {/* Vertical Timeline Line */}
              <div style={{ 
                position: 'absolute', left: '19px', top: '10px', bottom: '10px', 
                width: '2px', background: 'linear-gradient(to bottom, #30363d, transparent)' 
              }} />

              {history.length > 0 ? [...history].reverse().map((h, i) => {
                const isFake = h.result.includes('FAKE');
                const snippet = h.description || h.topic || "Automated System Scan";

                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '20px', 
                      position: 'relative',
                      zIndex: 2 
                    }}
                  >
                    {/* Status Bulb Container */}
                    <div style={{ marginTop: '15px' }}>
                      <div className="pulse-bulb" style={{ 
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: isFake ? '#f85149' : '#10b981',
                        boxShadow: `0 0 20px 5px ${isFake ? 'rgba(248, 81, 73, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                        border: '2px solid #fff'
                      }} />
                    </div>

                    {/* History Content Card */}
                    <div style={{ 
                      flex: 1, 
                      background: '#0d1117', 
                      border: `1px solid ${isFake ? 'rgba(248, 81, 73, 0.2)' : 'rgba(48, 54, 61, 1)'}`, 
                      borderRadius: '16px', 
                      padding: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: '0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = isFake ? '#f85149' : '#58a6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = isFake ? 'rgba(248, 81, 73, 0.2)' : '#30363d'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 900, 
                          color: isFake ? '#f85149' : '#10b981',
                          letterSpacing: '2px'
                        }}>
                          {isFake ? '● FRAUDULENT DETECTED' : '● GENUINE VERIFIED'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', color: '#8b949e' }}>
                          <Clock size={12} /> {h.timestamp}
                        </div>
                      </div>

                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#f0f6fc', 
                        lineHeight: '1.5',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '10px',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${isFake ? '#f85149' : '#10b981'}`
                      }}>
                        "{snippet.substring(0, 120)}..."
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #30363d', borderRadius: '24px' }}>
                  <Search size={30} style={{ opacity: 0.2, marginBottom: '10px' }} />
                  <p style={{ color: '#8b949e', fontSize: '0.8rem' }}>No system logs found in current session.</p>
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