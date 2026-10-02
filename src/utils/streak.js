/**
 * Calculates consecutive daily writing streak from journal entries.
 * Evaluates unique dates (YYYY-MM-DD) and counts consecutive preceding days.
 * 
 * @param {Array} entries 
 * @returns {{ streak: number, wroteToday: boolean, totalEntries: number }}
 */
export function calculateStreak(entries = []) {
  if (!entries || entries.length === 0) {
    return { streak: 0, wroteToday: false, totalEntries: 0 };
  }

  // Extract unique dates formatted as YYYY-MM-DD
  const dateSet = new Set();

  entries.forEach((entry) => {
    let dateStr = "";
    if (entry.date) {
      dateStr = entry.date;
    } else if (entry.createdAt?.toDate) {
      const d = entry.createdAt.toDate();
      dateStr = d.toISOString().split("T")[0];
    }

    if (dateStr) {
      dateSet.add(dateStr);
    }
  });

  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const wroteToday = dateSet.has(todayStr);
  const wroteYesterday = dateSet.has(yesterdayStr);

  // If user didn't write today or yesterday, active streak is 0
  if (!wroteToday && !wroteYesterday) {
    return {
      streak: 0,
      wroteToday: false,
      totalEntries: entries.length,
    };
  }

  // Start counting backwards
  let streak = 0;
  const checkDate = new Date(now);

  // If wrote today, start from today; otherwise start from yesterday
  if (!wroteToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const currentStr = formatYMD(checkDate);
    if (dateSet.has(currentStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    streak,
    wroteToday,
    totalEntries: entries.length,
  };
}
