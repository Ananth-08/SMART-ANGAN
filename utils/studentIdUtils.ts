/**
 * Utility to generate student IDs in the format: SA-[MonthCode][YearCode]-[Serial]
 * Example: SA-EA-0001 (May 2026, serial 1)
 */

export const getMonthCode = (monthIndex: number): string => {
  // 0 = Jan (A), 1 = Feb (B), ..., 4 = May (E), ...
  return String.fromCharCode(65 + monthIndex);
};

export const getYearCode = (year: number): string => {
  // 2026 = A, 2027 = B, etc.
  const baseYear = 2026;
  const yearDiff = year - baseYear;
  return String.fromCharCode(65 + Math.max(0, yearDiff));
};

export const formatSerialNumber = (serial: number): string => {
  return serial.toString().padStart(4, '0');
};

export const generateStudentId = (monthCode: string, yearCode: string, serial: number): string => {
  return `SA-${monthCode}${yearCode}-${formatSerialNumber(serial)}`;
};
