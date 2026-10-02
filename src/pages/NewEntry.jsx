import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createEntry, updateEntry } from "../firebase/journal";
import {
  MOODS,
  countWords,
  formatLongDate,
} from "../utils/journalHelpers";
import {
  ArrowLeft,
  Calendar,
  Check,
  Loader2,
  Sparkles,
  Star,
  AlertCircle,
  Eye,
  Save,
} from "lucide-react";

export default function NewEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayIso = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayIso);
  const [mood, setMood] = useState("Good");
  const [favorite, setFavorite] = useState(false);

  // Track the entry ID once created so future manual saves update the SAME doc
  const [savedEntryId, setSavedEntryId] = useState(null);

  // Save status: "idle" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const textareaRef = useRef(null);

  // Auto-grow textarea height as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(360, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  // Form input change handlers
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setHasUnsavedChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleMoodChange = (val) => {
    setMood(val);
    setHasUnsavedChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleFavoriteToggle = () => {
    setFavorite((prev) => !prev);
    setHasUnsavedChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  // Manual save routine (triggered exclusively when user clicks Save button)
  const handleManualSave = async () => {
    if (isSaving) return;

    const currentUid = user?.uid;
    if (!currentUid) {
      setSaveStatus("error");
      setErrorMessage("Authentication session loading...");
      return;
    }

    if (!title.trim() && !content.trim()) {
      setErrorMessage("Please enter a title or write some thoughts before saving.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!savedEntryId) {
        console.log("[NewEntry] Manually creating new entry document for user:", currentUid);
        const newId = await createEntry(currentUid, {
          title: title.trim() || "Untitled Entry",
          content,
          date,
          mood,
          favorite,
        });

        setSavedEntryId(newId);
        window.history.replaceState(null, "", `/entry/${newId}/edit`);
        console.log("[NewEntry] Entry successfully created with ID:", newId);
      } else {
        console.log("[NewEntry] Manually updating existing entry ID:", savedEntryId);
        await updateEntry(currentUid, savedEntryId, {
          title: title.trim() || "Untitled Entry",
          content,
          date,
          mood,
          favorite,
        });
      }

      setSaveStatus("saved");
      setSuccessMessage("✓ Entry saved successfully");
      setHasUnsavedChanges(false);
      setErrorMessage("");
    } catch (err) {
      console.error("[NewEntry] Save failed:", err);
      setSaveStatus("error");
      setErrorMessage("Couldn't save. We'll try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent accidental tab closure if unsaved edits are pending
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && (title.trim() || content.trim())) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, title, content]);

  // Safe navigation back to journal ensuring unsaved changes are confirmed
  const handleBackToJournal = () => {
    if (hasUnsavedChanges && (title.trim() || content.trim()) && saveStatus !== "saved") {
      const leave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!leave) return;
    }
    navigate("/journal");
  };

  const handleViewEntry = (e) => {
    if (hasUnsavedChanges && saveStatus !== "saved") {
      const leave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!leave) {
        e.preventDefault();
      }
    }
  };

  const words = countWords(content);
  const formattedDate = formatLongDate(date);
  const hasText = Boolean(title.trim() || content.trim());

  return (
    <main className="editor-page-container fade-in">
      <article className="editor-notebook-card">
        {/* 1. Top Navigation & Header Controls */}
        <header className="editor-nav-header">
          <button
            type="button"
            onClick={handleBackToJournal}
            className="btn-back-notebook"
            id="back-to-journal-btn"
            title="Return to Journal"
          >
            <ArrowLeft size={16} />
            <span>Back to Journal</span>
          </button>

          <div className="editor-nav-actions">
            {savedEntryId && (
              <Link
                to={`/entry/${savedEntryId}`}
                onClick={handleViewEntry}
                className="btn-view-saved-link"
                title="View saved entry"
              >
                <Eye size={14} />
                <span>View entry</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleManualSave}
              disabled={isSaving || !hasText}
              className="btn btn-secondary btn-sm btn-manual-save"
              id="manual-save-btn"
              title="Save changes now"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="spin-icon" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check size={13} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 2. Journal Entry Heading & Date */}
        <div className="editor-heading-section">
          <h1 className="editor-page-title">New Entry</h1>
          <div className="editor-date-row">
            <time className="editor-date-display">{formattedDate}</time>
            <label className="editor-date-picker-label" title="Change entry date">
              <Calendar size={14} className="date-picker-icon" />
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="editor-hidden-date-input"
                max={todayIso}
                aria-label="Change entry date"
              />
            </label>
          </div>
        </div>

        {successMessage && (
          <div className="editor-success-banner fade-in" role="status">
            <Check size={16} className="success-icon" />
            <p>{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="editor-error-banner fade-in" role="alert">
            <AlertCircle size={16} className="error-icon" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* 3. Editorial Title Field */}
        <div className="editor-title-container">
          <input
            type="text"
            placeholder="What happened today?"
            value={title}
            onChange={handleTitleChange}
            className="editor-editorial-title"
            autoFocus
            aria-label="Journal entry title"
            id="entry-title-input"
          />
        </div>

        {/* 4. Content Writing Canvas */}
        <div className="editor-content-container">
          <textarea
            ref={textareaRef}
            placeholder="Start writing..."
            value={content}
            onChange={handleContentChange}
            className="editor-editorial-textarea"
            aria-label="Journal entry content"
            id="entry-content-textarea"
          />
        </div>

        {/* 5. Paper Divider */}
        <hr className="editor-paper-divider" />

        {/* 6. Bottom Controls: Mood Selector & Favorite Toggle */}
        <div className="editor-controls-row">
          {/* Mood Pills */}
          <div className="editor-mood-group">
            <div className="mood-pills-row" role="radiogroup" aria-label="Select Mood">
              {MOODS.map((m) => {
                const MoodIcon = m.icon;
                const isSelected = mood.toLowerCase() === m.id.toLowerCase();
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleMoodChange(m.id)}
                    className={`mood-pill ${isSelected ? "mood-selected" : ""}`}
                    style={{
                      borderColor: isSelected ? m.borderColor : undefined,
                      backgroundColor: isSelected ? m.bgColor : undefined,
                      color: isSelected ? m.color : undefined,
                    }}
                    title={m.label}
                  >
                    <MoodIcon size={14} className="mood-pill-icon" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className={`btn-favorite-toggle ${favorite ? "is-favorited" : ""}`}
            title={favorite ? "Favorited entry" : "Mark as favorite"}
            aria-pressed={favorite}
            id="favorite-toggle-btn"
          >
            <Star
              size={15}
              className={`favorite-star-icon ${favorite ? "fill-current" : ""}`}
            />
            <span>{favorite ? "Favorited" : "Favorite"}</span>
          </button>
        </div>

        {/* 7. Footer: Word Count & Save Status */}
        <footer className="editor-status-footer">
          <div className="editor-word-count-badge">
            <Sparkles size={13} className="word-count-sparkle" />
            <span>{words} {words === 1 ? "word" : "words"}</span>
          </div>

          <div className="editor-save-status" aria-live="polite">
            {isSaving ? (
              <span className="status-badge status-saving">
                <Loader2 size={13} className="spin-icon" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="status-badge status-saved">
                <Check size={13} />
                <span>✓ Saved</span>
              </span>
            ) : saveStatus === "error" ? (
              <span className="status-badge status-error">
                <AlertCircle size={13} />
                <span>⚠ Couldn't save. We'll try again.</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="status-badge status-idle">
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="status-badge status-idle">
                <span>Not saved yet</span>
              </span>
            )}
          </div>
        </footer>
      </article>
    </main>
  );
}
