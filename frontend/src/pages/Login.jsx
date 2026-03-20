import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 🔥 Clear any previous stored user
        localStorage.removeItem("user_data");

        // ✅ Save fresh logged in user
        localStorage.setItem("user_data", JSON.stringify({
          name: data.user,
          email: data.email,
          history: data.history || []
        }));

        setIsLoading(false);
        navigate('/dashboard');
      } else {
        setIsLoading(false);
        alert(data.detail || "Invalid credentials");
      }

    } catch (error) {
      setIsLoading(false);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="azure-login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        .azure-login-root {
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
          z-index: 1;
        }

        .login-card-rect {
          width: 900px;
          height: 550px;
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

        .azure-input {
          width: 100%; padding: 1.1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #334155;
          border-radius: 12px;
          margin-bottom: 1.2rem;
          color: #fff;
          outline: none; transition: 0.3s;
        }

        .azure-input:focus {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.1);
        }

        .login-btn {
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

        .login-btn:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 189, 248, 0.2);
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
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
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
        className="login-card-rect"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
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

          <h3 className="mt-4 fw-900" style={{ color: '#fff', letterSpacing: '2px', marginTop: '20px' }}>
            Account Login
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginTop: '10px' }}>
            Secure Access Portal
          </p>
        </div>

        <div className="form-panel">
          <div className="mb-4" style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', margin: 0 }}>
              Welcome 
            </h1>
            <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '5px' }}>
              Please sign in to continue
            </p>
          </div>

          <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="label-text">Email Address</div>
            <input
              type="email"
              name="userEmail"
              autoComplete="new-email"
              className="azure-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="label-text">Password</div>
            <input
              type="password"
              name="userPassword"
              autoComplete="new-password"
              className="azure-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <motion.button
              type="submit"
              className="login-btn"
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link
              to="/signup"
              style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}
            >
              Don't have an account? <span style={{ color: '#38bdf8' }}>Create Account</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;