import { Feather } from "lucide-react";

export default function LoadingScreen({ message = "A quiet place for your thoughts..." }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-icon-wrapper">
          <Feather className="loading-icon" size={32} />
        </div>
        <p className="loading-text">{message}</p>
        <div className="loading-bar">
          <div className="loading-bar-inner"></div>
        </div>
      </div>
    </div>
  );
}
