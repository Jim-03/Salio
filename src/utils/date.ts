/**
 * Converts local date time to a Date object
 * @param date Date string with format (dd/mm/yy)
 * @param time Time string in format (hh:mm AM/PM)
 * @returns {Date} Date object
 */
export function getDateFromString(date: string, time: string): Date {
  const [day, month, year] = date.split("/");
  const [timeString, modifier] = time.split(/\s+/);
  let hour = Number(timeString.split(":")[0]);
  let minute = Number(timeString.split(":")[1]);

  if (modifier === "PM" && hour !== 12) {
    hour += 12;
  } else if (modifier === "AM" && hour === 12) {
    hour = 0;
  }

  return new Date(
    Number(year) + 2000,
    Number(month) - 1,
    Number(day),
    hour,
    minute,
  );
}
