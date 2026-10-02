import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscribeUserEntries } from "../firebase/journal";
import {
  getMoodMeta,
  formatLongDate,
  truncateContent,
} from "../utils/journalHelpers";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  AlertCircle,
  Star,
  BookOpen,
} from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Calendar month navigation state (current date by default)
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed (0 = Jan)

  // Selected date in YYYY-MM-DD format
  const todayIso = now.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const loading = authLoading || (user?.uid ? entriesLoading : false);

  // Subscribe to user entries
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
        console.error("[History] Error fetching entries:", err);
        setError("Couldn't load your journal history.");
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

  // Group entries by date (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((entry) => {
      const d =
        entry.date ||
        (entry.createdAt?.toDate
          ? entry.createdAt.toDate().toISOString().split("T")[0]
          : null);
      if (d) {
        if (!map[d]) map[d] = [];
        map[d].push(entry);
      }
    });
    return map;
  }, [entries]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Reset to today / current month
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    // Number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Day of week for first day (0 = Sun, 1 = Mon, ...)
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Convert to Monday-based index: 0 = Mon, 6 = Sun
    const startDayOffset = (firstDay.getDay() + 6) % 7;

    // Previous month's trailing days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Previous month trailing days
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        hasEntries: Boolean(entriesByDate[dateStr]?.length),
        entryCount: entriesByDate[dateStr]?.length || 0,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        hasEntries: Boolean(entriesByDate[dateStr]?.length),
        entryCount: entriesByDate[dateStr]?.length || 0,
      });
    }

    // 3. Next month leading days to complete grid (multiples of 7)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        hasEntries: Boolean(entriesByDate[dateStr]?.length),
        entryCount: entriesByDate[dateStr]?.length || 0,
      });
    }

    return days;
  }, [currentYear, currentMonth, entriesByDate]);

  // Month and Year heading text
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Selected date entries
  const selectedEntries = entriesByDate[selectedDate] || [];
  const selectedDateFormatted = formatLongDate(selectedDate);

  return (
    <main className="history-page-container fade-in">
      {/* 1. Header */}
      <header className="history-header">
        <div className="history-title-group">
          <Link to="/journal" className="btn-back-link mb-2" id="back-to-dashboard-btn">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <h1 className="history-page-title">Journal History</h1>
          <p className="history-subtitle">Every page you've written, all in one place.</p>
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div className="dashboard-error-card fade-in" role="alert">
          <AlertCircle size={22} className="error-card-icon" />
          <div className="error-card-content">
            <h3 className="error-card-title">Couldn't load your journal history.</h3>
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
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="history-loading-skeleton" role="status">
          <div className="skeleton-calendar" />
          <div className="skeleton-card" />
        </div>
      ) : (
        <div className="history-content-layout">
          {/* 2. Monthly Calendar Card */}
          <section className="history-calendar-card" aria-label="Journal Calendar">
            {/* Calendar Controls */}
            <div className="calendar-controls-header">
              <h2 className="calendar-month-heading">{monthName}</h2>
              <div className="calendar-nav-buttons">
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="btn-calendar-today"
                  title="Go to today"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="btn-calendar-nav"
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="btn-calendar-nav"
                  aria-label="Next month"
                  title="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="calendar-weekdays-grid">
              {WEEKDAYS.map((day) => (
                <div key={day} className="calendar-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="calendar-days-grid" role="grid">
              {calendarDays.map((dayObj) => {
                const isSelected = dayObj.dateStr === selectedDate;
                const isToday = dayObj.dateStr === todayIso;

                return (
                  <button
                    key={dayObj.dateStr}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    onClick={() => setSelectedDate(dayObj.dateStr)}
                    className={`calendar-day-cell ${
                      !dayObj.isCurrentMonth ? "day-outside-month" : ""
                    } ${isSelected ? "day-selected" : ""} ${isToday ? "day-today" : ""}`}
                    title={`${dayObj.dateStr}${
                      dayObj.entryCount ? ` (${dayObj.entryCount} entries)` : ""
                    }`}
                  >
                    <span className="day-number">{dayObj.dayNum}</span>
                    {dayObj.hasEntries && (
                      <span
                        className="day-entry-dot"
                        title={`${dayObj.entryCount} entries`}
                        aria-label={`${dayObj.entryCount} entries`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Selected Date Entries Section */}
          <section className="history-entries-section" aria-label="Entries for Selected Date">
            <div className="history-selected-header">
              <div className="selected-date-meta">
                <CalendarIcon size={16} className="selected-date-icon" />
                <h3 className="selected-date-title">{selectedDateFormatted}</h3>
              </div>
              {selectedEntries.length > 0 && (
                <span className="entries-count-badge">
                  {selectedEntries.length}{" "}
                  {selectedEntries.length === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {/* Entries List or Empty State */}
            {selectedEntries.length === 0 ? (
              <div className="empty-day-card fade-in">
                <BookOpen size={28} className="empty-day-icon" />
                <p className="empty-day-text">No entries for this day.</p>
                {selectedDate === todayIso && (
                  <Link to="/new" className="btn btn-primary btn-sm mt-2">
                    Write today's entry
                  </Link>
                )}
              </div>
            ) : (
              <div className="history-entries-list fade-in">
                {selectedEntries.map((entry) => {
                  const mood = getMoodMeta(entry.mood);
                  const MoodIcon = mood.icon;

                  return (
                    <article key={entry.id} className="history-entry-item">
                      <div className="history-entry-item-header">
                        <div className="history-entry-title-row">
                          <h4 className="history-entry-title">
                            {entry.title || "Untitled Entry"}
                          </h4>
                          {entry.favorite && (
                            <Star
                              size={15}
                              className="history-entry-star fill-current"
                              title="Favorited"
                            />
                          )}
                        </div>

                        <div
                          className="entry-card-mood"
                          style={{
                            color: mood.color,
                            backgroundColor: mood.bgColor,
                            borderColor: mood.borderColor,
                          }}
                        >
                          <MoodIcon size={13} className="mood-icon" />
                          <span>{mood.label}</span>
                        </div>
                      </div>

                      {entry.content && (
                        <p className="history-entry-preview">
                          {truncateContent(entry.content, 180)}
                        </p>
                      )}

                      <div className="history-entry-footer">
                        <Link
                          to={`/entry/${entry.id}`}
                          className="read-entry-link"
                          id={`read-entry-${entry.id}`}
                        >
                          <span>Read entry</span>
                          <span className="read-arrow">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
