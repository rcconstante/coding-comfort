import { isCalendarDate } from "./research-validation";

export function parsePickerDate(value: string): Date | undefined {
  if (!isCalendarDate(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date;
}
