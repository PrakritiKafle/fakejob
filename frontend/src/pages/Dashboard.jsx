import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, History, LogOut, Activity, Zap, Clock, Cpu, Search, Sun, Moon,
  Server, Database, FileText, CheckCircle, XCircle, AlertTriangle, ShieldAlert
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
          --bg-root: #f0f7ff;
          --bg-card: #ffffff;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border-color: #e2e8f0;
          --input-bg: #f8fafc;
          --card-shadow: 0 10px 30px rgba(56, 189, 248, 0.05);
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
          position: sticky; top: 1.5rem; align-self: start; display: flex; flex-direction: column; 
          overflow: hidden;
        }

        /* Custom Scrollbar for sidebar */
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(88, 166, 255, 0.2); border-radius: 4px; }

        .theme-toggle-single {
          background: rgba(88, 166, 255, 0.08); border: 1px solid rgba(88, 166, 255, 0.2);
          border-radius: 12px; padding: 10px 15px; display: flex; align-items: center; gap: 10px;
          color: var(--text-main); font-weight: 800; cursor: pointer; transition: 0.3s; width: fit-content; margin-bottom: 2rem;
        }
        .theme-toggle-single:hover { background: rgba(88, 166, 255, 0.15); }

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

        .glow-box-green { background: rgba(16, 185, 129, 0.1); box-shadow: 0 0 35px 15px rgba(16, 185, 129, 0.4); border: 2px solid #10b981; border-radius: 50%; padding: 18px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.4s ease; }
        .glow-box-red { background: rgba(248, 81, 73, 0.1); box-shadow: 0 0 35px 15px rgba(248, 81, 73, 0.4); border: 2px solid #f85149; border-radius: 50%; padding: 18px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.4s ease; }
        .glow-box-inactive { background: rgba(255, 255, 255, 0.02); border: 2px solid var(--border-color); border-radius: 50%; padding: 18px; display: inline-flex; opacity: 0.5; transition: all 0.4s ease; }
        .scan-pulse-anim { animation: scanpulse 2s infinite; }
        @keyframes scanpulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }

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

          {/* Single Icon Theme Toggle */}
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.8rem', letterSpacing: '2px' }}>
            THEME MODE
          </div>
          <button 
            className="theme-toggle-single"
            onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon size={18} color="#58a6ff" /> : <Sun size={18} color="#f39c12" />}
            <span style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              {theme === 'dark' ? 'DARK' : 'LIGHT'}
            </span>
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '2px' }}>
              ACTIVE MODELS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Cpu size={16} color="#58a6ff" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>SVM Kernel</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Zap size={16} color="#10b981" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Naive Bayes</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Database size={16} color="#f1e05a" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Logistic Regression</span>
              </div>
            </div>

            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '2px' }}>
              SYSTEM USAGE
            </div>
            <div style={{ padding: '15px', background: 'rgba(88, 166, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(88, 166, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={16} color="#58a6ff" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Total Scans</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#58a6ff' }}>{history.length}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>REAL</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>{history.filter(h => h.result === 'GENUINE').length}</div>
              </div>
              <div style={{ background: 'rgba(248, 81, 73, 0.05)', border: '1px solid rgba(248, 81, 73, 0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>FAKE</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f85149' }}>{history.filter(h => h.result === 'FAKE').length}</div>
              </div>
              <div style={{ background: 'rgba(243, 156, 18, 0.05)', border: '1px solid rgba(243, 156, 18, 0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>INVALID</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f39c12' }}>{history.filter(h => h.result === 'INVALID').length}</div>
              </div>
            </div>
          </div>

          <div className="user-highlight" style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '5px', letterSpacing: '2px' }}>LOGGED IN AS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user.name}</div>
            <button onClick={() => {
              localStorage.removeItem('user_data');
              navigate('/login');
            }} className="logout-btn"><LogOut size={16} /> Logout</button>
          </div>
        </aside>

        <main>
          <header style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Fake Job And Internship Advertisement Detection</h2>
            <p style={{ color: 'var(--text-muted)' }}>HYBRID MODEL</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '1.5rem', marginBottom: '3rem', alignItems: 'stretch' }}>
            {/* INPUT SECTION */}
            <div className="analysis-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#58a6ff', fontSize: '0.8rem' }}>
                  <FileText size={18} /> INPUT ADVERTISEMENT
                </span>
                <Server size={18} color="#58a6ff" />
              </div>
              <textarea
                className="input-area"
                style={{ flex: 1 }}
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
            <div className="analysis-card" style={{ border: '2px solid #58a6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div className="grid-bg"></div>
              {/* Replace the content inside the Results Scanner Card with this: */}
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <div className="scanner-container">
                    <div className="laser-line"></div>
                    <Activity size={50} color="#58a6ff" />
                    <p style={{ marginTop: '20px', fontWeight: 800, letterSpacing: '2px', color: '#58a6ff' }}>{analysisPhase}</p>
                  </div>
                ) : showResults && result ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '35px', marginTop: '15px' }}>
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div className={result.result_label === 'GENUINE' ? 'glow-box-green scan-pulse-anim' : 'glow-box-inactive'}>
                          <CheckCircle size={38} color={result.result_label === 'GENUINE' ? '#10b981' : 'var(--text-muted)'} />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: result.result_label === 'GENUINE' ? '#10b981' : 'var(--text-muted)', letterSpacing: '2px' }}>GENUINE</div>
                      </div>
                      
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div className={result.result_label === 'FAKE' ? 'glow-box-red scan-pulse-anim' : 'glow-box-inactive'}>
                          <AlertTriangle size={38} color={result.result_label === 'FAKE' ? '#f85149' : 'var(--text-muted)'} />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: result.result_label === 'FAKE' ? '#f85149' : 'var(--text-muted)', letterSpacing: '2px' }}>FAKE</div>
                      </div>
                    </div>

                    <h1 style={{
                      textAlign: 'center',
                      fontSize: result.result_label === 'INVALID' ? '2.5rem' : '4rem',
                      margin: '0',
                      color: result.result_label === 'INVALID' ? '#f39c12' : (result.result_label === 'FAKE' ? '#f85149' : '#10b981'),
                      textShadow: result.result_label === 'INVALID' ? 'none' : `0 0 20px ${result.result_label === 'FAKE' ? '#f8514955' : '#10b98155'}`
                    }}>
                      {result.result_label}
                    </h1>

                    <div style={{
                      textAlign: 'center',
                      background: result.result_label === 'INVALID' ? 'rgba(243, 156, 18, 0.1)' : 'rgba(88, 166, 255, 0.05)',
                      padding: '18px',
                      borderRadius: '16px',
                      margin: '25px 0',
                      border: result.result_label === 'INVALID' ? '1px solid #f39c12' : '1px solid rgba(88, 166, 255, 0.2)'
                    }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '8px', letterSpacing: '2px' }}>
                        SYSTEM ANALYSIS REPORT
                      </div>
                      <span style={{ fontSize: '1rem', color: result.result_label === 'INVALID' ? '#f39c12' : '#58a6ff', fontWeight: 800 }}>
                        {result.result_label === 'INVALID'
                          ? (result.battle_data?.Error ? `REASON: ${result.battle_data.Error.toUpperCase()}` : "REASON: INVALID INPUT") // Shows backend reason
                          : `CONFIDENCE SCORE: ${result.confidence}%`}
                      </span>
                    </div>

                    {result.result_label !== 'INVALID' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>FAKE SIGNAL</span>
                            <span style={{ fontSize: '0.9rem', color: '#f85149', fontWeight: 900 }}>{result.battle_data?.['Fake Signal']}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: result.battle_data?.['Fake Signal'] }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: '#f85149' }} />
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>GENUINE SIGNAL</span>
                            <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 900 }}>{result.battle_data?.['Genuine Signal']}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: result.battle_data?.['Genuine Signal'] }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: '#10b981' }} />
                          </div>
                        </div>
                        
                        <div style={{ gridColumn: 'span 2', background: 'rgba(88, 166, 255, 0.05)', border: '1px solid rgba(88, 166, 255, 0.2)', borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#58a6ff' }}>ALGORITHM: {result.battle_data?.Algorithm || "Ensemble Model"}</span>
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>STATUS: {result.battle_data?.Status || "VALIDATED"}</span>
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
                    <div style={{ marginTop: '10px', background: 'var(--bg-root)', padding: '5px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isInvalid ? <XCircle size={18} color="#6c757d" /> : (isFake ? <ShieldAlert size={18} color="#f85149" /> : <ShieldCheck size={18} color="#10b981" />)}
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