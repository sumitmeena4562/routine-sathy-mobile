/**
 * Centralized, resilient date and time utilities for Routine Sathy Mobile.
 */

export const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAY_CHARS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * Formats a JS Date to YYYY-MM-DD in local time zone.
 */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a 24-hour time string ("17:20", "06:00") into a clean 12-hour AM/PM string ("5:20 PM", "6:00 AM").
 */
export function formatTime12hr(timeStr?: string | null): string {
  if (!timeStr) return '--:--';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const m = mStr ? mStr.padStart(2, '0') : '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}
