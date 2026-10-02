import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getEntryById,
  deleteEntry,
  toggleFavoriteEntry,
} from "../firebase/journal";
import {
  getMoodMeta,
  formatEntryDate,
} from "../utils/journalHelpers";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import LoadingScreen from "../components/LoadingScreen";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Star,
  Trash2,
} from "lucide-react";

export default function ViewEntry() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user?.uid || !id) return;

    let isMounted = true;

    getEntryById(user.uid, id)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError("Entry not found. It may have been deleted.");
        } else {
          setEntry(data);
          setIsFavorite(Boolean(data.favorite));
          setError("");
        }
      })
      .catch((err) => {
        console.error("Failed to load entry:", err);
        if (isMounted) {
          setError("Failed to load this journal entry. Please try again.");
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

  const handleToggleFavorite = async () => {
    if (!user?.uid || !entry) return;
    const prev = isFavorite;
    setIsFavorite(!prev);

    try {
      await toggleFavoriteEntry(user.uid, entry.id, prev);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorite(prev);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user?.uid || !entry) return;
    setIsDeleting(true);
    setError("");

    try {
      await deleteEntry(user.uid, entry.id);
      navigate("/journal", { replace: true });
    } catch (err) {
      console.error("[ViewEntry] Failed to delete entry:", err);
      setError("Couldn't delete this entry. Please try again.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || authLoading) {
    return <LoadingScreen message="Opening your journal thoughts..." />;
  }

  if (error || !entry) {
    return (
      <main className="entry-view-container fade-in">
        <div className="entry-error-box">
          <h2>Entry Not Found</h2>
          <p>{error || "We couldn't find the entry you're looking for."}</p>
          <Link to="/journal" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const mood = getMoodMeta(entry.mood);
  const MoodIcon = mood.icon;

  return (
    <main className="entry-view-container fade-in">
      <article className="entry-view-card">
        {/* Navigation Bar */}
        <header className="entry-view-header">
          <button
            type="button"
            onClick={() => navigate("/journal")}
            className="btn-back-link"
            id="back-to-journal-btn"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="entry-view-controls">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`btn-star-round ${isFavorite ? "is-favorite" : ""}`}
              title={isFavorite ? "Favorited" : "Mark as favorite"}
              aria-label={isFavorite ? "Starred entry" : "Star entry"}
            >
              <Star
                size={18}
                className={isFavorite ? "fill-current" : ""}
              />
            </button>

            <Link
              to={`/entry/${entry.id}/edit`}
              className="btn btn-secondary btn-sm"
              id="edit-entry-btn"
            >
              <Edit3 size={15} />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger-ghost btn-sm"
              id="delete-entry-btn"
              title="Delete entry"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </header>

        {/* Metadata Strip */}
        <div className="entry-view-meta">
          <div className="meta-item">
            <Calendar size={15} className="meta-icon" />
            <time className="meta-date-text">
              {formatEntryDate(entry.date || entry.createdAt)}
            </time>
          </div>

          <div
            className="entry-mood-badge"
            style={{
              color: mood.color,
              backgroundColor: mood.bgColor,
              borderColor: mood.borderColor,
            }}
          >
            <MoodIcon size={14} />
            <span>{mood.label}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="entry-view-title">{entry.title || "Untitled Entry"}</h1>

        {/* Content Body with Preserved Linebreaks */}
        <div className="entry-view-body">
          {entry.content ? (
            entry.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="entry-paragraph">
                {paragraph.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))
          ) : (
            <p className="entry-empty-content italic">
              No written thoughts recorded in this entry.
            </p>
          )}
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entryTitle={entry.title}
      />
    </main>
  );
}
