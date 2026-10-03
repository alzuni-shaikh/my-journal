import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  LogIn,
  PenLine,
  Search,
  ShieldCheck,
  Smartphone,
  Smile,
  Sparkles,
  Star
} from "lucide-react";

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

  const handleSignIn = () => {
    if (user) {
      navigate("/journal");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="landing-wrapper fade-in">
      {/* Ambient background glow */}
      <div className="landing-ambient-glow" aria-hidden="true" />

      {/* 1. HERO SECTION */}
      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <Sparkles size={14} className="eyebrow-icon" />
            <span>YOUR PRIVATE DIGITAL JOURNAL</span>
          </div>

          <h1 id="hero-heading" className="landing-hero-title">
            A quiet place for your thoughts.
          </h1>

          <p className="landing-hero-description">
            Write, reflect, and keep your memories organized in a simple private journal.
          </p>

          <div className="landing-hero-cta">
            <button
              onClick={handleStartJournaling}
              className="btn btn-primary btn-lg landing-btn-primary"
              id="hero-start-btn"
            >
              <span>{user ? "Go to Your Journal" : "Start Journaling"}</span>
              <ArrowRight size={18} className="btn-arrow" />
            </button>

            {!user && (
              <button
                onClick={handleSignIn}
                className="btn btn-secondary btn-lg landing-btn-secondary"
                id="hero-signin-btn"
              >
                <LogIn size={17} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. TRUST / PRIVACY SECTION */}
      <section className="landing-section landing-trust-section" aria-labelledby="trust-heading">
        <div className="landing-trust-card">
          <div className="trust-icon-wrapper" aria-hidden="true">
            <ShieldCheck size={26} className="trust-icon" />
          </div>
          <div className="trust-text-content">
            <h2 id="trust-heading" className="trust-title">
              Your thoughts stay yours.
            </h2>
            <p className="trust-description">
              Your journal entries are private to your account. Sign in securely with Google and access your writing whenever you return.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SIMPLE 3-STEP SECTION */}
      <section className="landing-section landing-steps-section" aria-labelledby="steps-heading">
        <div className="section-header">
          <span className="section-kicker">How It Works</span>
          <h2 id="steps-heading" className="section-title">
            Simple by design
          </h2>
        </div>

        <div className="landing-steps-grid">
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">01</span>
              <div className="step-icon-badge" aria-hidden="true">
                <LogIn size={18} />
              </div>
            </div>
            <h3 className="step-name">Sign in</h3>
            <p className="step-text">
              Use your Google account to access your private journal.
            </p>
          </div>

          <div className="step-card">
            <div className="step-header">
              <span className="step-number">02</span>
              <div className="step-icon-badge" aria-hidden="true">
                <PenLine size={18} />
              </div>
            </div>
            <h3 className="step-name">Write</h3>
            <p className="step-text">
              Capture thoughts, memories, moods, and moments.
            </p>
          </div>

          <div className="step-card">
            <div className="step-header">
              <span className="step-number">03</span>
              <div className="step-icon-badge" aria-hidden="true">
                <BookOpen size={18} />
              </div>
            </div>
            <h3 className="step-name">Reflect</h3>
            <p className="step-text">
              Search your entries, revisit your history, and keep track of your writing.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="landing-section landing-features-section" aria-labelledby="features-heading">
        <div className="section-header">
          <span className="section-kicker">Features</span>
          <h2 id="features-heading" className="section-title">
            Everything you need to write peacefully
          </h2>
        </div>

        <div className="landing-features-grid">
          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
            <h3 className="feature-card-title">Private Journal</h3>
            <p className="feature-card-text">
              Keep your personal entries organized in your own account.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <Smile size={20} />
            </div>
            <h3 className="feature-card-title">Mood Tracking</h3>
            <p className="feature-card-text">
              Add a mood to each entry and see how your writing changes over time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <Star size={20} />
            </div>
            <h3 className="feature-card-title">Favorites</h3>
            <p className="feature-card-text">
              Mark meaningful entries so you can find them again quickly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <Search size={20} />
            </div>
            <h3 className="feature-card-title">Search & Filters</h3>
            <p className="feature-card-text">
              Find entries using search, favorites, and mood filters.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <Calendar size={20} />
            </div>
            <h3 className="feature-card-title">Writing History</h3>
            <p className="feature-card-text">
              Browse your journal through a visual calendar.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon-box" aria-hidden="true">
              <Smartphone size={20} />
            </div>
            <h3 className="feature-card-title">Mobile Friendly</h3>
            <p className="feature-card-text">
              Write and revisit your journal comfortably on smaller screens.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="landing-section landing-final-cta-section" aria-labelledby="final-cta-heading">
        <div className="final-cta-card">
          <div className="final-cta-sparkle" aria-hidden="true">
            <Sparkles size={28} />
          </div>
          <h2 id="final-cta-heading" className="final-cta-title">
            Give your thoughts a place to live.
          </h2>
          <p className="final-cta-text">
            Start your private journal today.
          </p>
          <button
            onClick={handleStartJournaling}
            className="btn btn-primary btn-lg final-cta-button"
            id="final-cta-start-btn"
          >
            <span>{user ? "Go to Your Journal" : "Start Journaling"}</span>
            <ArrowRight size={18} className="btn-arrow" />
          </button>
        </div>
      </section>

      {/* 6. MINIMAL FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="footer-brand">
            <span className="footer-brand-name">My Journal</span>
            <span className="footer-dot" aria-hidden="true">•</span>
            <span className="footer-tagline">A quiet place for your thoughts.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
