import type { Weekday } from '../schemas/section.js';

/** Human-readable formatting for schedule data. UI should call these only. */

const PAD = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/** 540 -> "9:00 AM", 720 -> "12:00 PM", 0 -> "12:00 AM". */
export const formatTimeOfDay = (mins: number, lowercase = false): string => {
    const safe = ((mins % 1440) + 1440) % 1440;
    const h24 = Math.floor(safe / 60);
    const m = safe % 60;
    const meridian = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const out = `${h12}:${PAD(m)} ${meridian}`;
    return lowercase ? out.replace('AM', 'am').replace('PM', 'pm') : out;
};

export const formatTimeRange = (startMin: number, endMin: number): string =>
    `${formatTimeOfDay(startMin)} – ${formatTimeOfDay(endMin)}`;

/** ['M','W','F'] -> "MWF", ['T','R'] -> "TR". */
export const formatDays = (days: Weekday[]): string => days.join('');

const DAY_LONG_NAMES: Record<Weekday, string> = {
    M: 'Mon',
    T: 'Tue',
    W: 'Wed',
    R: 'Thu',
    F: 'Fri',
    S: 'Sat',
    U: 'Sun'
};

export const formatDaysLong = (days: Weekday[]): string =>
    days.map((d) => DAY_LONG_NAMES[d]).join(', ');
