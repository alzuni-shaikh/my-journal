import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscribeUserEntries } from "../firebase/journal";
import JournalCard from "../components/JournalCard";
import {
  MOODS,
  getMoodMeta,
  getGreeting,
  getFormattedToday,
} from "../utils/journalHelpers";
import {
  BookOpen,
  Calendar,
  Flame,
  PenSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  X,
  AlertCircle,
} from "lucide-react";

export default function Journal() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "favorites"
  const [selectedMood, setSelectedMood] = useState("all"); // "all" | moodId
  const [retryTrigger, setRetryTrigger] = useState(0);

  const loading = authLoading || (user?.uid ? entriesLoading : false);

  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const unsubscribe = subscribeUserEntries(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries || []);
        setEntriesLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[Journal] Error fetching entries:", err);
        setError("Your journal couldn't be loaded. Please check your connection and try again.");
        setEntriesLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [authLoading, user?.uid, retryTrigger]);

  const handleRetry = () => {
    setEntriesLoading(true);
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  // --- JOURNAL INSIGHTS METRICS ---
  const favoriteCount = useMemo(() => {
    return entries.filter((e) => Boolean(e.favorite)).length;
  }, [entries]);

  const thisMonthCount = useMemo(() => {
    if (entries.length === 0) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return entries.filter((entry) => {
      if (!entry.date && !entry.createdAt) return false;
      let d;
      if (entry.date && typeof entry.date === "string") {
        const parts = entry.date.split("-");
        if (parts.length === 3) {
          d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
          d = new Date(entry.date);
        }
      } else if (entry.createdAt?.toDate && typeof entry.createdAt.toDate === "function") {
        d = entry.createdAt.toDate();
      } else if (entry.createdAt instanceof Date) {
        d = entry.createdAt;
      } else if (entry.createdAt) {
        d = new Date(entry.createdAt);
      } else {
        return false;
      }
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;
  }, [entries]);

  const mostCommonMoodMeta = useMemo(() => {
    if (entries.length === 0) return null;
    const moodCounts = {};
    entries.forEach((e) => {
      const m = e.mood || "Good";
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });

    let topMood = null;
    let maxCount = -1;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMood = mood;
      }
    });

    return topMood ? getMoodMeta(topMood) : null;
  }, [entries]);

  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;

    const entryDates = new Set();
    entries.forEach((e) => {
      let dateStr = "";
      if (e.date && typeof e.date === "string") {
        dateStr = e.date;
      } else if (e.createdAt?.toDate && typeof e.createdAt.toDate === "function") {
        dateStr = e.createdAt.toDate().toISOString().split("T")[0];
      } else if (e.createdAt instanceof Date) {
        dateStr = e.createdAt.toISOString().split("T")[0];
      }
      if (dateStr) {
        entryDates.add(dateStr);
      }
    });

    const today = new Date();
    const toDateString = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = toDateString(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateString(yesterday);

    let checkDate;
    if (entryDates.has(todayStr)) {
      checkDate = new Date(today);
    } else if (entryDates.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    } else {
      return 0;
    }

    let streak = 0;
    while (true) {
      const dateKey = toDateString(checkDate);
      if (entryDates.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Combined filtering: all loaded entries -> search filter -> favorite filter -> mood filter
  const filteredEntries = useMemo(() => {
    let result = entries;

    // 1. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((entry) => {
        const titleMatch = (entry.title || "").toLowerCase().includes(q);
        const contentMatch = (entry.content || "").toLowerCase().includes(q);
        const moodMatch = (entry.mood || "").toLowerCase().includes(q);
        return titleMatch || contentMatch || moodMatch;
      });
    }

    // 2. Favorite filter
    if (activeFilter === "favorites") {
      result = result.filter((entry) => Boolean(entry.favorite));
    }

    // 3. Mood filter
    if (selectedMood !== "all") {
      result = result.filter(
        (entry) => (entry.mood || "").toLowerCase() === selectedMood.toLowerCase()
      );
    }

    return result;
  }, [entries, searchQuery, activeFilter, selectedMood]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSelectedMood("all");
  };

  const isFiltering = searchQuery.trim() !== "" || activeFilter !== "all" || selectedMood !== "all";

  const greeting = getGreeting(user?.displayName);
  const todayFormatted = getFormattedToday();
  const CommonMoodIcon = mostCommonMoodMeta ? mostCommonMoodMeta.icon : Sparkles;

  return (
    <main className="dashboard-container fade-in">
      {/* 1. Header: Warm Greeting, Today's Date, Tagline & Write Button */}
      <header className="dashboard-header-simple">
        <div className="header-greeting-block">
          <h1 className="dashboard-greeting-title">{greeting}</h1>
          <time className="dashboard-date-text">{todayFormatted}</time>
          <p className="dashboard-tagline">A quiet place for your thoughts.</p>
        </div>

        <div className="header-cta-block">
          <Link
            to="/new"
            className="btn btn-primary btn-lg btn-write-today"
            id="write-today-btn"
          >
            <Plus size={18} />
            <span>Write today's entry</span>
          </Link>
        </div>
      </header>

      {/* 2. Journal Insights Section */}
      {!loading && !error && entries.length > 0 && (
        <section className="journal-insights-section" aria-label="Journal Insights">
          <div className="insights-grid">
            {/* 1. Total Entries */}
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-label">Total Entries</span>
                <BookOpen size={15} className="insight-icon" />
              </div>
              <div className="insight-value">{entries.length}</div>
              <span className="insight-subtext">all recorded pages</span>
            </div>

            {/* 2. Favorites */}
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-label">Favorites</span>
                <Star size={15} className="insight-icon" style={{ color: "var(--star-gold)" }} />
              </div>
              <div className="insight-value">{favoriteCount}</div>
              <span className="insight-subtext">cherished thoughts</span>
            </div>

            {/* 3. This Month */}
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-label">This Month</span>
                <Calendar size={15} className="insight-icon" />
              </div>
              <div className="insight-value">{thisMonthCount}</div>
              <span className="insight-subtext">entries this month</span>
            </div>

            {/* 4. Most Common Mood */}
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-label">Common Mood</span>
                <CommonMoodIcon
                  size={15}
                  className="insight-icon"
                  style={{ color: mostCommonMoodMeta?.color || "var(--accent-primary)" }}
                />
              </div>
              <div className="insight-value" style={{ fontSize: "1.15rem" }}>
                {mostCommonMoodMeta ? mostCommonMoodMeta.label : "—"}
              </div>
              <span className="insight-subtext">most frequent vibe</span>
            </div>

            {/* 5. Writing Streak */}
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-label">Streak</span>
                <Flame size={15} className="insight-icon" style={{ color: "#E89B50" }} />
              </div>
              <div className="insight-value">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </div>
              <span className="insight-subtext">
                {currentStreak > 0 ? "keep it going!" : "ready to write"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. Journal Search Field */}
      <section className="dashboard-search-section" aria-label="Search Journal">
        <div className="search-input-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search your journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search journal entries"
            id="journal-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn-clear-search"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {/* 4. Mood Filter Section */}
      {!loading && !error && entries.length > 0 && (
        <section className="mood-filter-section" aria-label="Filter by Mood">
          <div className="mood-filter-header">
            <span className="mood-filter-label">Filter by mood</span>
          </div>
          <div className="mood-filter-pills" role="radiogroup" aria-label="Select Mood Filter">
            <button
              type="button"
              role="radio"
              aria-checked={selectedMood === "all"}
              onClick={() => setSelectedMood("all")}
              className={`mood-filter-btn ${selectedMood === "all" ? "mood-filter-btn-active" : ""}`}
              id="mood-filter-all"
            >
              <Sparkles size={13} className="mood-filter-icon" />
              <span>All</span>
            </button>
            {MOODS.map((m) => {
              const MoodIcon = m.icon;
              const isSelected = selectedMood.toLowerCase() === m.id.toLowerCase();
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedMood(isSelected ? "all" : m.id)}
                  className={`mood-filter-btn ${isSelected ? "mood-filter-btn-active" : ""}`}
                  style={{
                    borderColor: isSelected ? m.borderColor : undefined,
                    backgroundColor: isSelected ? m.bgColor : undefined,
                    color: isSelected ? m.color : undefined,
                  }}
                  id={`mood-filter-${m.id.toLowerCase()}`}
                  title={`Filter by ${m.label}`}
                >
                  <MoodIcon size={13} className="mood-filter-icon" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Recent Entries Section */}
      <section className="dashboard-entries-section">
        <div className="entries-section-header">
          <div className="section-title-group">
            <h2 className="recent-entries-title">Recent entries</h2>
            {!loading && !error && entries.length > 0 && (
              <span className="entries-count-badge">
                {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>

          {/* Filter Pills: All | Favorites */}
          {!loading && !error && entries.length > 0 && (
            <div className="filter-pills-row" role="tablist" aria-label="Filter Entries">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
                className={`filter-pill ${activeFilter === "all" ? "filter-pill-active" : ""}`}
                id="filter-all-btn"
              >
                <span>All</span>
                <span className="filter-pill-count">({entries.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === "favorites"}
                onClick={() => setActiveFilter("favorites")}
                className={`filter-pill ${activeFilter === "favorites" ? "filter-pill-active" : ""}`}
                id="filter-favorites-btn"
              >
                <Star size={13} className={activeFilter === "favorites" ? "fill-current" : ""} />
                <span>Favorites</span>
                <span className="filter-pill-count">({favoriteCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading || authLoading ? (
          <div className="entries-loading-skeleton" role="status">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="dashboard-error-card fade-in" role="alert">
            <AlertCircle size={22} className="error-card-icon" />
            <div className="error-card-content">
              <h3 className="error-card-title">Your journal couldn't be loaded.</h3>
              <p className="error-card-desc">Please check your connection and try again.</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="btn btn-secondary btn-sm btn-retry"
            >
              <RefreshCw size={14} />
              <span>Try again</span>
            </button>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State — User has no entries */
          <div className="empty-journal-card fade-in">
            <div className="empty-icon-wrapper">
              <BookOpen size={36} className="empty-icon" />
            </div>
            <h3 className="empty-title">Your journal is still empty.</h3>
            <p className="empty-description">
              Your first page is waiting for you.
            </p>
            <Link
              to="/new"
              className="btn btn-primary btn-lg"
              id="write-first-entry-btn"
            >
              <PenSquare size={17} />
              <span>Write your first entry</span>
            </Link>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* Empty State — Filter or Search returned 0 */
          <div className="no-results-card fade-in">
            <Sparkles size={28} className="empty-filter-star" />
            <h3 className="no-results-title">No entries found</h3>
            <p className="no-results-text">
              {searchQuery.trim() && selectedMood !== "all" && activeFilter === "favorites"
                ? `No favorite "${selectedMood}" entries found matching "${searchQuery}".`
                : searchQuery.trim() && selectedMood !== "all"
                ? `No "${selectedMood}" entries found matching "${searchQuery}".`
                : searchQuery.trim()
                ? `Nothing found in your journal for "${searchQuery}".`
                : selectedMood !== "all" && activeFilter === "favorites"
                ? `No favorite entries found with mood "${selectedMood}".`
                : selectedMood !== "all"
                ? `No entries found with mood "${selectedMood}".`
                : activeFilter === "favorites"
                ? "No favorite entries yet. Star an entry while writing or viewing to keep your cherished memories here."
                : "No entries match your current filters."}
            </p>
            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          /* Recent Entries Grid */
          <div className="entries-grid">
            {filteredEntries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
