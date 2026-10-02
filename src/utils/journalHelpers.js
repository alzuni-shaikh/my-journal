import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  Flame,
  Moon,
} from "lucide-react";

export const MOODS = [
  {
    id: "Great",
    label: "Great",
    icon: Sparkles,
    color: "#8A6818",
    bgColor: "#F8DFA5",
    borderColor: "#E8C87A",
  },
  {
    id: "Good",
    label: "Good",
    icon: Smile,
    color: "#386641",
    bgColor: "#D8EAD9",
    borderColor: "#B2D4B5",
  },
  {
    id: "Okay",
    label: "Okay",
    icon: Meh,
    color: "#7A5E43",
    bgColor: "#FDE3D2",
    borderColor: "#F8CDB5",
  },
  {
    id: "Sad",
    label: "Sad",
    icon: Frown,
    color: "#446578",
    bgColor: "#DDE8F0",
    borderColor: "#BED2E0",
  },
  {
    id: "Angry",
    label: "Angry",
    icon: Flame,
    color: "#993B22",
    bgColor: "#FAD9D0",
    borderColor: "#F28C6B",
  },
  {
    id: "Tired",
    label: "Tired",
    icon: Moon,
    color: "#615B6E",
    bgColor: "#EBE5F0",
    borderColor: "#D4C9DF",
  },
];

/**
 * Returns mood metadata by ID
 * @param {string} moodId 
 */
export function getMoodMeta(moodId) {
  return MOODS.find((m) => m.id.toLowerCase() === (moodId || "").toLowerCase()) || MOODS[2];
}

/**
 * Returns a warm, personalized greeting based on current local hour
 * @param {string} displayName 
 */
export function getGreeting(displayName) {
  const hour = new Date().getHours();
  const firstName = displayName ? displayName.split(" ")[0] : "Friend";

  if (hour < 12) {
    return `Good morning, ${firstName}.`;
  } else if (hour < 17) {
    return `Good afternoon, ${firstName}.`;
  } else {
    return `Good evening, ${firstName}.`;
  }
}

/**
 * Returns today's date formatted nicely (e.g. "Monday, September 21, 2026")
 */
export function getFormattedToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date string or timestamp into readable text
 * @param {string|Date|object} dateVal 
 */
export function formatEntryDate(dateVal) {
  if (!dateVal) return "";

  let dateObj;
  if (typeof dateVal === "string") {
    // If YYYY-MM-DD string, construct safely with local timezone
    const parts = dateVal.split("-");
    if (parts.length === 3) {
      dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      dateObj = new Date(dateVal);
    }
  } else if (dateVal.toDate && typeof dateVal.toDate === "function") {
    // Firestore Timestamp
    dateObj = dateVal.toDate();
  } else if (dateVal instanceof Date) {
    dateObj = dateVal;
  } else {
    dateObj = new Date();
  }

  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncates text safely for previews
 */
export function truncateContent(text, maxLength = 140) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Counts words sensibly without counting empty spaces
 * @param {string} text 
 * @returns {number}
 */
export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Formats a date string, timestamp, or Date into long editorial format (e.g. "September 21, 2026")
 * @param {string|Date|object} dateVal 
 * @returns {string}
 */
export function formatLongDate(dateVal) {
  if (!dateVal) return "";

  let dateObj;
  if (typeof dateVal === "string") {
    const parts = dateVal.split("-");
    if (parts.length === 3) {
      dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      dateObj = new Date(dateVal);
    }
  } else if (dateVal?.toDate && typeof dateVal.toDate === "function") {
    dateObj = dateVal.toDate();
  } else if (dateVal instanceof Date) {
    dateObj = dateVal;
  } else {
    dateObj = new Date();
  }

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

