import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Feather, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartJournaling = () => {
    if (user) {
      navigate("/journal");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="landing-container fade-in">
      <div className="landing-ambient-glow" aria-hidden="true" />
      
      <div className="landing-content">
        <div className="landing-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Free • Private • Simple</span>
        </div>

        <h1 className="landing-title">
          JOURNAL.
        </h1>

        <p className="landing-tagline">
          A quiet place for your thoughts.
        </p>

        <p className="landing-description">
          Write about your day, your ideas, your memories, or simply whatever is on your mind.
        </p>

        <div className="landing-cta-group">
          <button
            onClick={handleStartJournaling}
            className="btn btn-primary btn-lg start-button"
            id="start-journaling-btn"
          >
            <span>Start Journaling</span>
            <ArrowRight size={18} className="btn-arrow" />
          </button>
        </div>

        <div className="landing-features-minimal">
          <div className="feature-item">
            <Shield size={16} className="feature-icon" />
            <span>100% Private to You</span>
          </div>
          <div className="feature-divider">•</div>
          <div className="feature-item">
            <Feather size={16} className="feature-icon" />
            <span>Distraction Free</span>
          </div>
          <div className="feature-divider">•</div>
          <div className="feature-item">
            <Sparkles size={16} className="feature-icon" />
            <span>Always Free</span>
          </div>
        </div>
      </div>
    </main>
  );
}
