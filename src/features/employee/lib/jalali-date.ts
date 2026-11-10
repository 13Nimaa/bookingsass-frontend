export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060,
  2097, 2192, 2262, 2324, 2394, 2456, 3178,
] as const;

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export const JALALI_WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function mod(a: number, b: number) {
  return a - Math.trunc(a / b) * b;
}

function jalaliCalendar(year: number, withoutLeap = false) {
  if (year < BREAKS[0] || year >= BREAKS.at(-1)!) {
    throw new RangeError("Jalali year is out of the supported range.");
  }

  const gregorianYear = year + 621;
  let leapJ = -14;
  let previous: number = BREAKS[0];
  let jump = 0;

  for (let index = 1; index < BREAKS.length; index += 1) {
    const current = BREAKS[index];
    jump = current - previous;
    if (year < current) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previous = current;
  }

  let yearsSinceBreak = year - previous;
  leapJ += div(yearsSinceBreak, 33) * 8 + div(mod(yearsSinceBreak, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - yearsSinceBreak === 4) leapJ += 1;

  const leapG = div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (withoutLeap) return { gregorianYear, march };

  if (jump - yearsSinceBreak < 6) {
    yearsSinceBreak = yearsSinceBreak - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod(mod(yearsSinceBreak + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gregorianYear, march };
}

function gregorianToJulianDay(year: number, month: number, day: number) {
  let julianDay = div((year + div(month - 8, 6) + 100100) * 1461, 4);
  julianDay += div(153 * mod(month + 9, 12) + 2, 5) + day - 34840408;
  julianDay -= div(div(year + 100100 + div(month - 8, 6), 100) * 3, 4) - 752;
  return julianDay;
}

function julianDayToGregorian(julianDay: number) {
  let value = 4 * julianDay + 139361631;
  value += div(div(4 * julianDay + 183187720, 146097) * 3, 4) * 4 - 3908;
  const dayValue = div(mod(value, 1461), 4) * 5 + 308;
  return {
    year: div(value, 1461) - 100100 + div(8 - (mod(div(dayValue, 153), 12) + 1), 6),
    month: mod(div(dayValue, 153), 12) + 1,
    day: div(mod(dayValue, 153), 5) + 1,
  };
}

function jalaliToJulianDay(year: number, month: number, day: number) {
  const calendar = jalaliCalendar(year, true);
  return gregorianToJulianDay(calendar.gregorianYear, 3, calendar.march) +
    (month - 1) * 31 -
    div(month, 7) * (month - 7) +
    day - 1;
}

function julianDayToJalali(julianDay: number): JalaliDate {
  const gregorian = julianDayToGregorian(julianDay);
  let year = gregorian.year - 621;
  const calendar = jalaliCalendar(year);
  const firstDay = gregorianToJulianDay(gregorian.year, 3, calendar.march);
  let daysSinceNewYear = julianDay - firstDay;

  if (daysSinceNewYear >= 0) {
    if (daysSinceNewYear <= 185) {
      return {
        year,
        month: 1 + div(daysSinceNewYear, 31),
        day: mod(daysSinceNewYear, 31) + 1,
      };
    }
    daysSinceNewYear -= 186;
  } else {
    year -= 1;
    daysSinceNewYear += 179;
    if (calendar.leap === 1) daysSinceNewYear += 1;
  }

  return {
    year,
    month: 7 + div(daysSinceNewYear, 30),
    day: mod(daysSinceNewYear, 30) + 1,
  };
}

export function jalaliMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return jalaliCalendar(year).leap === 0 ? 30 : 29;
}

export function jalaliToGregorianIso(date: JalaliDate) {
  if (date.month < 1 || date.month > 12 || date.day < 1 || date.day > jalaliMonthLength(date.year, date.month)) {
    throw new RangeError("Invalid Jalali date.");
  }
  const gregorian = julianDayToGregorian(jalaliToJulianDay(date.year, date.month, date.day));
  return `${gregorian.year}-${String(gregorian.month).padStart(2, "0")}-${String(gregorian.day).padStart(2, "0")}`;
}

export function gregorianIsoToJalali(isoDate: string): JalaliDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new RangeError("Expected a Gregorian ISO date.");
  return julianDayToJalali(gregorianToJulianDay(Number(match[1]), Number(match[2]), Number(match[3])));
}

export function todayJalali(): JalaliDate {
  const today = new Date();
  return gregorianIsoToJalali(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
}

/** Negative when `a` is before `b`; 0 when equal; positive when after. */
export function compareJalali(a: JalaliDate, b: JalaliDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function formatJalaliDate(date: JalaliDate, options?: { includeWeekday?: boolean }) {
  const isoDate = jalaliToGregorianIso(date);
  const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(options?.includeWeekday ? { weekday: "long" } : {}),
  }).format(new Date(`${isoDate}T12:00:00`));
  return formatted;
}

export function formatGregorianIsoToJalali(isoDate: string, options?: { includeWeekday?: boolean }) {
  return formatJalaliDate(gregorianIsoToJalali(isoDate), options);
}

export function addJalaliMonths(date: JalaliDate, amount: number): JalaliDate {
  const monthIndex = date.year * 12 + date.month - 1 + amount;
  const year = div(monthIndex, 12);
  const month = mod(monthIndex, 12) + 1;
  return { year, month, day: Math.min(date.day, jalaliMonthLength(year, month)) };
}

export function shiftGregorianIsoDate(isoDate: string, amount: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const shifted = new Date(year, month - 1, day + amount);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}-${String(shifted.getDate()).padStart(2, "0")}`;
}
