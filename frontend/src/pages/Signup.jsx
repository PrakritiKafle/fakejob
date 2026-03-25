import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';


const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully. Please sign in.");
        navigate('/');
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="azure-signup-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        .azure-signup-root {
          height: 100vh; width: 100vw;
          background: #f0f7ff; 
          background-image: radial-gradient(circle at center, #e0f2fe 0%, #f0f7ff 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .azure-particle {
          position: absolute;
          background: #7dd3fc;
          border-radius: 50%;
          filter: blur(1px);
          z-index: 1;
        }

        .signup-card-rect {
          width: 900px; 
          height: 580px;
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 24px;
          display: flex;
          z-index: 10;
          box-shadow: 0 40px 100px rgba(15, 23, 42, 0.3);
          overflow: hidden;
        }

        .visual-panel {
          flex: 1;
          background: #1e293b;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative;
          border-right: 1px solid rgba(56, 189, 248, 0.1);
        }

        .core-ai {
          width: 110px; height: 110px;
          background: #38bdf8;
          border-radius: 20px;
          display: flex; gap: 10px;
          align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.4);
          z-index: 2;
        }

        .core-eye { width: 12px; height: 12px; background: #fff; border-radius: 50%; }

        .form-panel {
          flex: 1.3;
          padding: 60px;
          color: #f8fafc;
          display: flex; flex-direction: column; justify-content: center;
        }

        .input-wrapper { position: relative; display: flex; align-items: center; margin-bottom: 1.2rem; }
        .input-icon { position: absolute; left: 16px; color: #64748b; transition: 0.3s; pointer-events: none; }

        .azure-input {
          width: 100%; padding: 1.1rem; padding-left: 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #334155;
          border-radius: 12px;
          color: #fff;
          outline: none; transition: 0.3s;
        }

        .azure-input:focus {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.08);
        }
        .azure-input:focus + .input-icon { color: #38bdf8; }

        .signup-btn {
          background: #38bdf8;
          color: #0f172a;
          border: none;
          padding: 1.1rem;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .signup-btn:hover {
          background: #fff;
          transform: translateY(-2px);
        }

        .label-text {
          font-size: 0.75rem; font-weight: 800; color: #38bdf8;
          margin-bottom: 8px; letter-spacing: 2px;
        }
      `}</style>

      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="azure-particle"
          style={{
            width: Math.random() * 7 + 3,
            height: Math.random() * 7 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: '#7dd3fc',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
            position: 'absolute',
            borderRadius: '50%',
            zIndex: 1,
          }}
          animate={{ 
            y: [0, -150, 0], 
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1] 
          }}
          transition={{ 
            duration: Math.random() * 7 + 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div 
        className="signup-card-rect"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="visual-panel">
          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              borderRadius: ["20px", "40px", "20px"] 
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="core-ai"
          >
            <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="core-eye" />
            <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="core-eye" />
          </motion.div>

          <h3 className="mt-4 fw-900" style={{ color: '#fff', letterSpacing: '2px' }}>
            Create Account
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            Quick and Secure Registration
          </p>
        </div>

        <div className="form-panel">
          <div className="mb-4">
            <h1 className="fw-900 mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
              Welcome
            </h1>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>
              Create your account to get started
            </p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="label-text">Full Name</div>
            <div className="input-wrapper">
              <input 
                type="text" className="azure-input" placeholder="Enter your full name"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <User className="input-icon" size={20} />
            </div>

            <div className="label-text">Email Address</div>
            <div className="input-wrapper">
              <input 
                type="email" className="azure-input" placeholder="Enter your email"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
              <Mail className="input-icon" size={20} />
            </div>

            <div className="label-text">Password</div>
            <div className="input-wrapper">
              <input 
                type="password" className="azure-input" placeholder="Enter your password"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
              <Lock className="input-icon" size={20} />
            </div>

            <motion.button 
              type="submit" disabled={loading} className="signup-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
             <Link to="/" className="text-decoration-none small fw-900" style={{ color: '#94a3b8' }}>
                Already have an account? <span style={{ color: '#38bdf8' }}>Sign In</span>
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;