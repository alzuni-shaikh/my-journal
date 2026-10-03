import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/auth";
import { BookOpen, Calendar, LayoutDashboard, LogOut, PenSquare, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  return (
    <header className="navbar-container">
      <nav className="navbar-content">
        <Link
          to={user ? "/journal" : "/"}
          className="navbar-brand"
          aria-label="Journal Home"
        >
          <BookOpen className="brand-icon" size={20} />
          <span className="brand-name">JOURNAL.</span>
        </Link>

        <div className="navbar-actions">
          {!loading && (
            <>
              {user ? (
                <div className="navbar-user-group">
                  {location.pathname !== "/new" && (
                    <Link
                      to="/new"
                      className="btn btn-primary btn-sm btn-nav-write"
                      id="nav-write-btn"
                      aria-label="Write new entry"
                      title="Write entry"
                    >
                      <PenSquare size={15} />
                      <span className="write-text">Write</span>
                    </Link>
                  )}

                  <Link
                    to="/journal"
                    className={`nav-link ${
                      location.pathname === "/journal" ? "nav-link-active" : ""
                    }`}
                    aria-label="Dashboard"
                    title="Dashboard"
                  >
                    <LayoutDashboard size={16} className="nav-link-icon" />
                    <span className="nav-link-text">Dashboard</span>
                  </Link>

                  <Link
                    to="/history"
                    className={`nav-link ${
                      location.pathname === "/history" ? "nav-link-active" : ""
                    }`}
                    aria-label="History"
                    title="History"
                  >
                    <Calendar size={16} className="nav-link-icon" />
                    <span className="nav-link-text">History</span>
                  </Link>

                  <div className="nav-user-pill">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User avatar"}
                        className="nav-user-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="nav-user-avatar fallback-avatar">
                        <UserIcon size={14} />
                      </div>
                    )}
                    <span className="nav-user-name">
                      {user.displayName
                        ? user.displayName.split(" ")[0]
                        : "Journaler"}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-nav-logout"
                    title="Sign Out"
                    aria-label="Sign Out"
                    id="nav-signout-btn"
                  >
                    <LogOut size={16} />
                    <span className="logout-text">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="navbar-auth-links">
                  {location.pathname !== "/login" && (
                    <Link to="/login" className="btn btn-secondary btn-sm">
                      Sign In
                    </Link>
                  )}
                  {location.pathname === "/login" && (
                    <Link to="/" className="btn btn-ghost btn-sm">
                      Back to Home
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
