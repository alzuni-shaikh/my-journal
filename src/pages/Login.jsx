import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithGoogle } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const from = location.state?.from?.pathname || "/journal";
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signInWithGoogle();
      const from = location.state?.from?.pathname || "/journal";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Sign-in failed:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in was cancelled before completion.");
      } else if (error.code === "auth/popup-blocked") {
        setErrorMessage("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === "auth/network-request-failed") {
        setErrorMessage("A network error occurred. Please check your internet connection.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMessage("This domain is not authorized for Firebase Authentication. Please check Firebase console settings.");
      } else {
        setErrorMessage(error.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-container fade-in">
      <div className="login-ambient-glow" aria-hidden="true" />
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>Private Sanctuary</span>
          </div>
          <h1 className="login-title">Welcome back.</h1>
          <p className="login-subtitle">Your thoughts are waiting for you.</p>
        </div>

        {errorMessage && (
          <div className="error-alert fade-in" role="alert">
            <AlertCircle size={18} className="error-icon" />
            <p className="error-text">{errorMessage}</p>
          </div>
        )}

        <div className="login-actions">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || authLoading}
            className="btn btn-google btn-lg"
            id="google-signin-btn"
            aria-label="Continue with Google"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="login-footer">
          <button
            onClick={() => navigate("/")}
            className="btn-back-home"
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Back to Journal</span>
          </button>
        </div>
      </div>
    </main>
  );
}
