import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { formatTimeOfDay, type Section, type Weekday } from '@utsaregplus/core';
import { cn } from '@utsaregplus/ui';

/**
 * Weekly schedule grid — Mon..Fri, 8am..9pm, sections positioned absolutely.
 *
 * Rendering model:
 *   - One column per weekday (5 columns, M-F).
 *   - Time axis is a fixed-height ladder: each row is one hour.
 *   - Sections become rectangles whose top/height is computed from
 *     startMin / (endMin - startMin) of each meeting block.
 *   - Color cycles through a small palette so different courses are
 *     visually distinct without us having to maintain a per-course color map.
 */

const DAYS: Weekday[] = ['M', 'T', 'W', 'R', 'F'];
const DAY_LABEL: Record<Weekday, string> = {
    M: 'Mon',
    T: 'Tue',
    W: 'Wed',
    R: 'Thu',
    F: 'Fri',
    S: 'Sat',
    U: 'Sun'
};

const DAY_HEADER_LABEL: Record<Weekday, { abbr: string; full: string }> = {
    M: { abbr: 'M', full: 'Monday' },
    T: { abbr: 'T', full: 'Tuesday' },
    W: { abbr: 'W', full: 'Wednesday' },
    R: { abbr: 'R', full: 'Thursday' },
    F: { abbr: 'F', full: 'Friday' },
    S: { abbr: 'S', full: 'Saturday' },
    U: { abbr: 'U', full: 'Sunday' }
};

const SECTION_PALETTE = [
    {
        bg: 'bg-[--accent-soft]',
        border: 'border-[--accent-default]',
        text: 'text-[--accent-active]'
    },
    {
        bg: 'bg-[--brand-soft]',
        border: 'border-[--brand-default]',
        text: 'text-[--brand-default]'
    },
    {
        bg: 'bg-[--status-info-soft]',
        border: 'border-[--status-info]',
        text: 'text-[--status-info]'
    },
    {
        bg: 'bg-[--status-open-soft]',
        border: 'border-[--status-open]',
        text: 'text-[--status-open]'
    },
    {
        bg: 'bg-[--status-warn-soft]',
        border: 'border-[--status-warn]',
        text: 'text-[--status-warn]'
    }
];

const colorFor = (courseId: string): (typeof SECTION_PALETTE)[number] => {
    let hash = 0;
    for (const ch of courseId) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return SECTION_PALETTE[Math.abs(hash) % SECTION_PALETTE.length] ?? SECTION_PALETTE[0]!;
};

const FIRST_HOUR = 8; // 8 AM
const LAST_HOUR = 21; // 9 PM
const HOUR_HEIGHT = 56; // px

export interface WeeklyScheduleGridProps {
    sections: Section[];
    onSectionClick?: (section: Section) => void;
    /** Highlight CRNs (e.g. those that are conflicting). */
    conflictCrns?: Set<string>;
}

interface PositionedBlock {
    section: Section;
    day: Weekday;
    startMin: number;
    endMin: number;
    location: string;
}

export const WeeklyScheduleGrid = ({
    sections,
    onSectionClick,
    conflictCrns
}: WeeklyScheduleGridProps) => {
    const blocks = useMemo<PositionedBlock[]>(() => {
        const out: PositionedBlock[] = [];
        for (const section of sections) {
            for (const m of section.meetings) {
                for (const day of m.days) {
                    if (DAYS.includes(day)) {
                        out.push({
                            section,
                            day,
                            startMin: m.startMin,
                            endMin: m.endMin,
                            location: m.location
                        });
                    }
                }
            }
        }
        return out;
    }, [sections]);

    const onlineSections = sections.filter((s) => s.meetings.every((m) => m.days.length === 0));
    const hasAnyMeeting = blocks.length > 0;
    const hasNothing = sections.length === 0;

    if (hasNothing) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 px-8 space-y-4 border border-dashed border-[--border-default] rounded-2xl bg-[--surface-muted]">
                <div className="w-14 h-14 rounded-2xl bg-[--brand-soft] flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-[--brand-default]" />
                </div>
                <div>
                    <h3 className="text-[16px] font-bold text-[--ink-strong]">
                        Build your weekly view
                    </h3>
                    <p className="text-[13px] text-[--ink-muted] mt-1">
                        Add sections from Explore and they'll plot here automatically.
                    </p>
                </div>
            </div>
        );
    }

    const hours: number[] = [];
    for (let h = FIRST_HOUR; h <= LAST_HOUR; h++) hours.push(h);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[64px_repeat(5,1fr)] border border-[--border-default] rounded-2xl bg-[--surface-default] overflow-hidden">
                {/* Column headers */}
                <div className="border-b border-[--border-default] bg-[--surface-muted]" />
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="border-b border-l border-[--border-default] bg-[--surface-muted] py-3 text-center"
                    >
                        <div className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                            {DAY_HEADER_LABEL[d].abbr}
                        </div>
                        <div className="text-[12px] font-semibold text-[--ink-strong]">
                            {DAY_HEADER_LABEL[d].full}
                        </div>
                    </div>
                ))}

                {/* Time gutter + day columns */}
                <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                    {hours.map((h, i) => (
                        <div
                            key={h}
                            className="absolute left-0 right-0 text-[10px] text-[--ink-subtle] utsa-tabular pr-2 text-right border-t border-[--border-default]"
                            style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                        >
                            <span className="absolute right-2 top-1">
                                {formatTimeOfDay(h * 60)}
                            </span>
                        </div>
                    ))}
                </div>

                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="relative border-l border-[--border-default]"
                        style={{ height: hours.length * HOUR_HEIGHT }}
                    >
                        {hours.map((h, i) => (
                            <div
                                key={h}
                                className="absolute left-0 right-0 border-t border-[--border-default]/50"
                                style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                            />
                        ))}
                        {blocks
                            .filter((b) => b.day === day)
                            .map((b, idx) => {
                                const startHr = b.startMin / 60;
                                const endHr = b.endMin / 60;
                                const top = (startHr - FIRST_HOUR) * HOUR_HEIGHT;
                                const height = (endHr - startHr) * HOUR_HEIGHT;
                                if (top < -8 || top > hours.length * HOUR_HEIGHT) return null;
                                const c = colorFor(b.section.courseId);
                                const isConflict = conflictCrns?.has(b.section.crn) ?? false;
                                return (
                                    <button
                                        type="button"
                                        key={`${b.section.crn}-${day}-${idx}`}
                                        onClick={() => {
                                            onSectionClick?.(b.section);
                                        }}
                                        className={cn(
                                            'absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 text-left',
                                            'transition-all hover:shadow-md hover:-translate-y-px',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--border-focus]/55',
                                            c.bg,
                                            c.border,
                                            c.text,
                                            isConflict && 'ring-2 ring-[--status-danger]/60'
                                        )}
                                        style={{
                                            top: top + 2,
                                            height: Math.max(height - 4, 24)
                                        }}
                                    >
                                        <div className="text-[11px] font-bold leading-tight truncate utsa-tabular">
                                            {b.section.courseId}
                                        </div>
                                        <div className="text-[9px] leading-tight opacity-80 truncate">
                                            §{b.section.sectionCode}
                                            {b.location ? ` · ${b.location}` : ''}
                                        </div>
                                        <div className="text-[9px] leading-tight opacity-70 utsa-tabular">
                                            {formatTimeOfDay(b.startMin, true)}
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                ))}
            </div>

            {!hasAnyMeeting && (
                <p className="text-[12px] text-[--ink-muted] text-center">
                    All sections are online — nothing to plot.
                </p>
            )}
            {onlineSections.length > 0 && hasAnyMeeting && (
                <div className="rounded-xl border border-[--border-default] bg-[--surface-muted] px-4 py-2 text-[12px] text-[--ink-muted]">
                    <span className="font-semibold text-[--ink-strong]">
                        {onlineSections.length} online section
                        {onlineSections.length === 1 ? '' : 's'}
                    </span>{' '}
                    not shown on grid: {onlineSections.map((s) => s.courseId).join(', ')}
                </div>
            )}
        </div>
    );
};

export { DAY_LABEL };
