import { useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { getMoodMeta, formatEntryDate, truncateContent } from "../utils/journalHelpers";

export default function JournalCard({ entry }) {
  const navigate = useNavigate();

  const mood = getMoodMeta(entry.mood);
  const MoodIcon = mood.icon;
  const isFavorite = Boolean(entry.favorite);

  const handleCardClick = () => {
    navigate(`/entry/${entry.id}`);
  };

  return (
    <article
      className="journal-entry-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
      aria-label={`Open entry: ${entry.title || "Untitled Entry"}`}
    >
      {/* Top Header: Title and optional Favorite Star */}
      <div className="entry-card-header">
        <h3 className="entry-card-title">{entry.title || "Untitled Entry"}</h3>
        {isFavorite && (
          <span className="entry-card-star" title="Favorited entry" aria-label="Favorited">
            <Star size={16} className="star-icon fill-current" />
          </span>
        )}
      </div>

      {/* Subtitle: Date · Mood */}
      <div className="entry-card-meta">
        <time className="entry-card-date">
          {formatEntryDate(entry.date || entry.createdAt)}
        </time>
        <span className="meta-separator">·</span>
        <span
          className="entry-card-mood"
          style={{
            color: mood.color,
            backgroundColor: mood.bgColor,
            borderColor: mood.borderColor,
          }}
        >
          <MoodIcon size={12} className="mood-icon" />
          <span>{mood.label}</span>
        </span>
      </div>

      {/* Body: Short Preview Excerpt */}
      <p className="entry-card-preview">
        {truncateContent(entry.content || "No thoughts recorded yet.", 150)}
      </p>

      {/* Footer: Read entry link */}
      <div className="entry-card-footer">
        <span className="read-entry-link">
          <span>Read entry</span>
          <ArrowRight size={14} className="read-arrow" />
        </span>
      </div>
    </article>
  );
}
