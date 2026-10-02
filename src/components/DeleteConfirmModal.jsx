import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting, entryTitle }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onClose : undefined} role="presentation">
      <div
        className="modal-card fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="modal-close-btn"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="modal-icon-wrapper danger-glow">
          <AlertTriangle size={24} className="danger-icon" />
        </div>

        <h3 id="modal-title" className="modal-title">
          Delete this entry?
        </h3>

        <p className="modal-description">
          Are you sure you want to delete{" "}
          <span className="entry-name-highlight">"{entryTitle || "Untitled Entry"}"</span>?
          This action is permanent and cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary btn-modal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger btn-modal"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? "Deleting..." : "Delete Entry"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
