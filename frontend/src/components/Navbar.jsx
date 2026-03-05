import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  // Using 'user' to match your storage logic
  const user = localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .navbar-custom {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .brand-logo {
          font-weight: 800;
          font-size: 1.5rem;
          color: #2c3e50 !important;
          letter-spacing: -0.5px;
        }

        .brand-logo span {
          color: #3498db;
        }

        .nav-hover {
          color: #64748b !important;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-hover:hover {
          color: #3498db !important;
        }

        /* Active link indicator */
        .active-link {
          color: #3498db !important;
        }

        .btn-logout {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 50px;
          padding: 6px 20px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s;
        }

        .btn-logout:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        .navbar-nav .nav-item {
          display: flex;
          align-items: center;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-custom py-3 mb-4">
        <div className="container">
          <Link className="navbar-brand brand-logo" to="/">
            Fake<span>Job</span>Detector
          </Link>
          
          <div className="d-flex align-items-center">
            <ul className="navbar-nav me-3 d-flex flex-row">
              {!user ? (
                <>
                  <li className="nav-item px-2">
                    <Link className="nav-link nav-hover" to="/">Login</Link>
                  </li>
                  <li className="nav-item px-2">
                    <Link className="nav-link nav-hover active-link" to="/signup">Signup</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item px-2">
                  <Link className="nav-link nav-hover" to="/dashboard">Dashboard</Link>
                </li>
              )}
            </ul>
            
            {user && (
              <button 
                className="btn btn-logout ms-2" 
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;