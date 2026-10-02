/**
 * JournalDoodles - Subtle, lightweight inline SVG hand-drawn paper journal doodles.
 * Placed in background margins with low opacity and pointer-events: none.
 */

export default function JournalDoodles() {
  return (
    <div className="journal-doodles-container" aria-hidden="true">
      {/* Top Left: Gentle Rising Sun & Delicate Sparkle */}
      <div className="doodle-item doodle-top-left-1">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Half sun setting / rising over soft horizon line */}
          <path d="M12 48 C12 34.7, 22.7 24, 36 24 C49.3 24, 60 34.7, 60 48" />
          <path d="M6 48 L66 48" />
          {/* Gentle sunbeams */}
          <path d="M36 14 L36 8" />
          <path d="M20 20 L15 15" />
          <path d="M52 20 L57 15" />
          <path d="M10 32 L4 30" />
          <path d="M62 32 L68 30" />
          {/* Subtle water / earth ripple */}
          <path d="M16 54 L56 54" />
          <path d="M24 60 L48 60" />
        </svg>
      </div>

      <div className="doodle-item doodle-top-left-2">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {/* Hand drawn 4-point golden hour sparkle */}
          <path d="M15 2 C15 9, 21 15, 28 15 C21 15, 15 21, 15 28 C15 21, 9 15, 2 15 C9 15, 15 9, 15 2 Z" />
        </svg>
      </div>

      {/* Top Right: Fluffy Sunset Cloud & Crescent Moon with Tiny Star */}
      <div className="doodle-item doodle-top-right-1">
        <svg width="68" height="46" viewBox="0 0 68 46" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Fluffy dreamy cloud */}
          <path d="M14 36 C6 36, 4 28, 10 22 C8 14, 20 8, 28 14 C34 6, 50 6, 54 14 C64 13, 67 22, 63 29 C68 35, 63 36, 54 36 Z" />
          {/* Soft inner shade line */}
          <path d="M22 30 C28 26, 42 26, 48 30" />
        </svg>
      </div>

      <div className="doodle-item doodle-top-right-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Tiny twinkling star cluster */}
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <path d="M22 6 L23 10 L27 10 L24 13 L25 17 L22 14 L19 17 L20 13 L17 10 L21 10 Z" />
          <circle cx="26" cy="24" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Middle Left: Peaceful Botanical Leaf Sprig */}
      <div className="doodle-item doodle-mid-left-1">
        <svg width="42" height="64" viewBox="0 0 42 64" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Botanical stem with soft leaves */}
          <path d="M10 58 C14 40, 24 24, 34 6" />
          <path d="M16 44 C8 40, 6 32, 12 30 C18 28, 20 36, 18 42" />
          <path d="M22 34 C28 30, 34 34, 28 40 C24 42, 20 36, 22 34" />
          <path d="M28 22 C22 18, 18 10, 24 8 C30 8, 30 16, 28 22" />
          <path d="M33 10 C38 6, 42 10, 39 15 C36 18, 32 14, 33 10" />
        </svg>
      </div>

      <div className="doodle-item doodle-mid-left-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {/* Small gentle heart */}
          <path d="M14 7 C10 1, 2 3, 2 10 C2 17, 12 21, 14 24 C16 21, 26 17, 26 10 C26 3, 18 1, 14 7 Z" />
        </svg>
      </div>

      {/* Middle Right: Open Journal Book & Sunset Arc */}
      <div className="doodle-item doodle-mid-right-1">
        <svg width="48" height="38" viewBox="0 0 48 38" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Open diary notebook */}
          <path d="M24 10 C18 6, 8 6, 4 10 L4 30 C8 26, 18 26, 24 30 C30 26, 40 26, 44 30 L44 10 C40 6, 30 6, 24 10 Z" />
          <path d="M24 10 L24 30" />
          <path d="M8 15 C13 13, 18 13, 20 15" />
          <path d="M8 20 C13 18, 18 18, 20 20" />
          <path d="M28 15 C30 13, 35 13, 40 15" />
          <path d="M28 20 C30 18, 35 18, 40 20" />
        </svg>
      </div>

      <div className="doodle-item doodle-mid-right-2">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {/* Tiny sun sparkle */}
          <circle cx="17" cy="17" r="4" />
          <path d="M17 5 L17 9" />
          <path d="M17 25 L17 29" />
          <path d="M5 17 L9 17" />
          <path d="M25 17 L29 17" />
        </svg>
      </div>

      {/* Bottom Left: Little Cozy Home & Sunset Horizon */}
      <div className="doodle-item doodle-bottom-left-1">
        <svg width="48" height="50" viewBox="0 0 48 50" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Tiny cozy house */}
          <path d="M8 22 L24 9 L40 22" />
          <path d="M12 20 L12 44 L36 44 L36 20" />
          <path d="M20 44 L20 32 L28 32 L28 44" />
          <path d="M30 13 L30 8 L34 8 L34 16" />
          {/* Heart chimney smoke */}
          <path d="M32 5 C31 3, 33 1, 35 3 C37 1, 39 3, 38 5 C36 7, 35 8, 35 8 Z" />
        </svg>
      </div>

      <div className="doodle-item doodle-bottom-left-2">
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {/* Sunset glow arcs */}
          <path d="M4 24 C4 13, 36 13, 36 24" />
          <path d="M10 24 C10 16, 30 16, 30 24" />
          <path d="M16 24 C16 20, 24 20, 24 24" />
        </svg>
      </div>

      {/* Bottom Right: Fluttering Butterfly & Tiny Blossom */}
      <div className="doodle-item doodle-bottom-right-1">
        <svg width="44" height="38" viewBox="0 0 44 38" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Butterfly */}
          <path d="M22 12 C22 18, 22 24, 22 28" />
          <path d="M22 16 C15 8, 5 10, 7 20 C9 26, 17 24, 22 20" />
          <path d="M22 16 C29 8, 39 10, 37 20 C35 26, 27 24, 22 20" />
          <path d="M22 20 C16 22, 11 28, 15 32 C19 34, 21 28, 22 24" />
          <path d="M22 20 C28 22, 33 28, 29 32 C25 34, 23 28, 22 24" />
          <path d="M20 12 C17 8, 15 7, 13 8" />
          <path d="M24 12 C27 8, 29 7, 31 8" />
        </svg>
      </div>

      <div className="doodle-item doodle-bottom-right-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {/* 4-petal flower */}
          <circle cx="16" cy="16" r="3" />
          <path d="M16 13 C16 8, 13 8, 13 13" />
          <path d="M16 19 C16 24, 19 24, 19 19" />
          <path d="M13 16 C8 16, 8 19, 13 19" />
          <path d="M19 16 C24 16, 24 13, 19 13" />
        </svg>
      </div>
    </div>
  );
}
