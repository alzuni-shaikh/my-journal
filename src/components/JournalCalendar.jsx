import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

export default function JournalCalendar({ entries = [], selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Create a map of date string (YYYY-MM-DD) -> entry count
  const entryDateMap = new Map();
  entries.forEach((entry) => {
    let dateStr = "";
    if (entry.date) {
      dateStr = entry.date;
    } else if (entry.createdAt?.toDate) {
      dateStr = entry.createdAt.toDate().toISOString().split("T")[0];
    }
    if (dateStr) {
      entryDateMap.set(dateStr, (entryDateMap.get(dateStr) || 0) + 1);
    }
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDayKey = (day) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <div className="calendar-title-group">
          <CalendarIcon size={16} className="calendar-title-icon" />
          <h4 className="calendar-month-title">
            {monthNames[month]} {year}
          </h4>
        </div>

        <div className="calendar-nav-controls">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="btn-clear-date-filter"
              title="Clear date filter"
            >
              <X size={13} />
              <span>Show all</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="btn-calendar-nav"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="btn-calendar-nav"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* Empty cells before month start */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}

        {/* Month days */}
        {Array.from({ length: totalDays }).map((_, index) => {
          const dayNumber = index + 1;
          const dayKey = formatDayKey(dayNumber);
          const hasEntries = entryDateMap.has(dayKey);
          const isSelected = selectedDate === dayKey;
          const isToday = todayStr === dayKey;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => {
                if (hasEntries) {
                  onSelectDate(isSelected ? null : dayKey);
                }
              }}
              disabled={!hasEntries}
              className={`calendar-day ${hasEntries ? "has-entry" : ""} ${
                isSelected ? "is-selected" : ""
              } ${isToday ? "is-today" : ""}`}
              title={
                hasEntries
                  ? `${entryDateMap.get(dayKey)} entry on ${dayKey}`
                  : `No entries on ${dayKey}`
              }
            >
              <span className="day-number">{dayNumber}</span>
              {hasEntries && <span className="entry-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
