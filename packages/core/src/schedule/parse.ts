import type { Meeting, Weekday } from '../schemas/section.js';

/**
 * Time / day string parsers for ASAP-flavored input.
 *
 * Pure: no DOM, no Date. Easy to unit-test exhaustively.
 */

const DAY_LETTERS: Record<string, Weekday> = {
    M: 'M',
    T: 'T',
    W: 'W',
    R: 'R',
    F: 'F',
    S: 'S',
    U: 'U'
};

/**
 * "MWF"  -> ['M','W','F']
 * "TR"   -> ['T','R']
 * "TTh"  -> ['T','R']     (Th is the long-form for R)
 * "MTuW" -> ['M','T','W'] (Tu and Th are the only ambiguous tokens)
 * "M-F"  -> ['M','T','W','R','F']
 *
 * Throws on tokens that don't decode — callers validate before display.
 */
export const parseDays = (input: string): Weekday[] => {
    const cleaned = input.trim();
    if (cleaned.length === 0) return [];
    if (/^Internet$/i.test(cleaned) || /^Online$/i.test(cleaned)) return [];

    // Range form: "M-F", "T-R"
    const rangeMatch = /^([MTWRFSU])\s*[-–]\s*([MTWRFSU])$/.exec(cleaned);
    if (rangeMatch) {
        const order: Weekday[] = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
        const start = order.indexOf(rangeMatch[1] as Weekday);
        const end = order.indexOf(rangeMatch[2] as Weekday);
        if (start === -1 || end === -1 || start > end) {
            throw new Error(`parseDays: invalid range "${cleaned}"`);
        }
        return order.slice(start, end + 1);
    }

    // Walk through the string consuming "Tu" / "Th" before single-letter days.
    const out: Weekday[] = [];
    let i = 0;
    while (i < cleaned.length) {
        const ch = cleaned[i];
        if (!ch) break;
        // Two-letter forms
        if (cleaned.slice(i, i + 2) === 'Tu') {
            out.push('T');
            i += 2;
            continue;
        }
        if (cleaned.slice(i, i + 2) === 'Th') {
            out.push('R');
            i += 2;
            continue;
        }
        // Single letter
        const mapped = DAY_LETTERS[ch.toUpperCase()];
        if (!mapped) {
            if (/\s/.test(ch)) {
                i += 1;
                continue;
            }
            throw new Error(`parseDays: unrecognized day token "${ch}" in "${input}"`);
        }
        out.push(mapped);
        i += 1;
    }
    return out;
};

export interface TimeRange {
    startMin: number;
    endMin: number;
}

/**
 * "9:00am"        -> 540
 * "12:00pm"       -> 720
 * "12:30pm"       -> 750
 * "1:00pm"        -> 780
 * "12:00am"       ->   0
 * Whitespace and trailing punctuation tolerated.
 */
export const parseTimeOfDay = (input: string): number => {
    const m = /^(\d{1,2}):?(\d{0,2})\s*([ap])\.?m\.?$/i.exec(input.trim());
    if (!m) throw new Error(`parseTimeOfDay: cannot parse "${input}"`);
    let hour = parseInt(m[1] ?? '0', 10);
    // Captured minute group is "" when the input is bare-hour like "9am".
    const rawMin = m[2] ?? '';
    const minute = rawMin === '' ? 0 : parseInt(rawMin, 10);
    const meridian = (m[3] ?? '').toLowerCase();
    if (hour < 1 || hour > 12) throw new Error(`parseTimeOfDay: hour out of range in "${input}"`);
    if (minute < 0 || minute > 59)
        throw new Error(`parseTimeOfDay: minute out of range in "${input}"`);
    if (hour === 12) hour = 0;
    if (meridian === 'p') hour += 12;
    return hour * 60 + minute;
};

/**
 * "9:00am-9:50am"          -> {startMin: 540, endMin: 590}
 * "9:00-9:50am"            -> {startMin: 540, endMin: 590}    (am inferred)
 * "11:00 am-12:15 pm"      -> {startMin: 660, endMin: 735}
 * "01:00 pm-01:50 pm"      -> {startMin: 780, endMin: 830}
 *
 * If only the second half has am/pm, we infer the first. This handles the
 * common ASAP rendering "9:00-9:50am".
 */
export const parseTimeRange = (input: string): TimeRange => {
    const cleaned = input.trim().replace(/\s+/g, ' ');
    if (/^(?:Internet|Online|TBA)$/i.test(cleaned)) {
        throw new Error(`parseTimeRange: non-time literal "${cleaned}"`);
    }
    const dashSplit = cleaned.split(/\s*[-–]\s*/);
    if (dashSplit.length !== 2) {
        throw new Error(`parseTimeRange: expected "start-end" in "${input}"`);
    }
    // eslint-disable-next-line prefer-const -- startStr is reassigned in the meridian-inference branch below
    let [startStr, endStr] = dashSplit as [string, string];
    const hasMeridian = (s: string): boolean => /[ap]\.?m\.?$/i.test(s.trim());

    if (!hasMeridian(startStr) && hasMeridian(endStr)) {
        // Borrow meridian from end. This is mostly safe, but collapses the
        // 12-hour wraparound (e.g. "11:30-1:00pm"). For that case the inferred
        // start meridian is "am" if start hour > end hour, else same as end.
        const trailing = /([ap]\.?m\.?)$/i.exec(endStr);
        const endMeridian = (trailing?.[1] ?? '').toLowerCase().replace('.', '');
        const startHour = parseInt(/^(\d{1,2})/.exec(startStr)?.[1] ?? '0', 10);
        const endHour = parseInt(/^(\d{1,2})/.exec(endStr)?.[1] ?? '0', 10);
        const startMeridian = endMeridian === 'pm' && startHour > endHour ? 'am' : endMeridian;
        startStr = `${startStr.trim()}${startMeridian}`;
    }

    const startMin = parseTimeOfDay(startStr);
    const endMin = parseTimeOfDay(endStr);
    if (endMin <= startMin) {
        throw new Error(
            `parseTimeRange: end "${endStr}" not after start "${startStr}" in "${input}"`
        );
    }
    return { startMin, endMin };
};

/**
 * High-level: build a Meeting from raw ASAP fields. Returns null when the
 * section has no scheduled meetings (online-async, TBA, etc.) — callers
 * should treat the section as having empty Section.meetings.
 */
export const buildMeeting = (daysStr: string, timeStr: string, location = ''): Meeting | null => {
    const days = parseDays(daysStr);
    if (days.length === 0) return null;
    let range: TimeRange;
    try {
        range = parseTimeRange(timeStr);
    } catch {
        return null;
    }
    return {
        days,
        startMin: range.startMin,
        endMin: range.endMin,
        location: location.trim()
    };
};
