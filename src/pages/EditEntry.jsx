import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEntryById, updateEntry, deleteEntry } from "../firebase/journal";
import {
  MOODS,
  countWords,
  formatLongDate,
} from "../utils/journalHelpers";
import LoadingScreen from "../components/LoadingScreen";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
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
  Trash2,
} from "lucide-react";

export default function EditEntry() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("Good");
  const [favorite, setFavorite] = useState(false);

  // Save status: "idle" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef(null);

  // Load entry data from Firestore
  useEffect(() => {
    if (!user?.uid || !id) return;

    let isMounted = true;

    getEntryById(user.uid, id)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setNotFound(true);
        } else {
          setTitle(data.title || "");
          setContent(data.content || "");
          setDate(data.date || new Date().toISOString().split("T")[0]);
          setMood(data.mood || "Good");
          setFavorite(Boolean(data.favorite));
          setSaveStatus("idle");
          setErrorMessage("");
          setHasUnsavedChanges(false);
        }
      })
      .catch((err) => {
        console.error("[EditEntry] Fetch error:", err);
        if (isMounted) {
          setErrorMessage("Failed to load this journal entry.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.uid, id]);

  // Auto-grow textarea height
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

  const handleMoodChange = (newMood) => {
    setMood(newMood);
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
    if (!currentUid || !id) {
      setSaveStatus("error");
      setErrorMessage("Authentication session expired.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("[EditEntry] Manually saving entry ID:", id);
      await updateEntry(currentUid, id, {
        title: title.trim() || "Untitled Entry",
        content,
        date,
        mood,
        favorite,
      });

      setSaveStatus("saved");
      setSuccessMessage("✓ Changes saved successfully");
      setHasUnsavedChanges(false);
      setErrorMessage("");
    } catch (err) {
      console.error("[EditEntry] Update error:", err);
      setSaveStatus("error");
      setErrorMessage("Couldn't save. We'll try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Entry execution
  const handleDeleteConfirm = async () => {
    if (!user?.uid || !id) return;
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deleteEntry(user.uid, id);
      navigate("/journal", { replace: true });
    } catch (err) {
      console.error("[EditEntry] Failed to delete entry:", err);
      setErrorMessage("Couldn't delete this entry. Please try again.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Prevent accidental tab closure if unsaved edits are pending
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Safe navigation back to journal ensuring unsaved changes are confirmed
  const handleBackToJournal = () => {
    if (hasUnsavedChanges && saveStatus !== "saved") {
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

  if (loading || authLoading) {
    return <LoadingScreen message="Opening your journal thoughts..." />;
  }

  if (notFound) {
    return (
      <main className="editor-page-container fade-in">
        <div className="entry-error-box">
          <h2>Entry Not Found</h2>
          <p>We couldn't find the entry you want to edit.</p>
          <Link to="/journal" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const words = countWords(content);
  const formattedDate = formatLongDate(date);
  const todayIso = new Date().toISOString().split("T")[0];

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
            <Link
              to={`/entry/${id}`}
              onClick={handleViewEntry}
              className="btn-view-saved-link"
              title="View this entry"
            >
              <Eye size={14} />
              <span>View entry</span>
            </Link>

            <button
              type="button"
              onClick={handleManualSave}
              disabled={isSaving}
              className="btn btn-secondary btn-sm btn-manual-save"
              id="manual-save-edit-btn"
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

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-delete-editor"
              id="delete-entry-btn"
              title="Delete this entry"
              aria-label="Delete entry"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </header>

        {/* 2. Heading & Date */}
        <div className="editor-heading-section">
          <h1 className="editor-page-title">Edit Entry</h1>
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
            aria-label="Journal entry title"
            id="edit-title-input"
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
            id="edit-content-textarea"
          />
        </div>

        {/* 5. Paper Divider */}
        <hr className="editor-paper-divider" />

        {/* 6. Bottom Controls: Mood Selector & Favorite Toggle */}
        <div className="editor-controls-row">
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
                <span>All changes saved</span>
              </span>
            )}
          </div>
        </footer>
      </article>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entryTitle={title}
      />
    </main>
  );
}
