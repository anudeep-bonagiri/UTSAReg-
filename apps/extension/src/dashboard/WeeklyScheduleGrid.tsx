import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { formatTimeOfDay, type Section, type Weekday } from '@utsaregplus/core';
import { cn } from '@utsaregplus/ui';

/**
 * Weekly schedule grid — adaptive bounds.
 *
 *   - Days shown: M-F by default; auto-includes Sat/Sun if any section has
 *     a weekend meeting.
 *   - Hour range: defaults to 8 AM – 9 PM but expands to fit any section
 *     that starts earlier (a 7:30 AM lab) or ends later (a 9:30 PM seminar).
 *   - Overlapping meetings on the same day render side-by-side as columns
 *     within the day, never stacked at the same coordinate.
 *
 * Color cycles by hash of courseId so different courses are visually
 * distinct without us tracking a per-course palette.
 */

const DEFAULT_DAYS: Weekday[] = ['M', 'T', 'W', 'R', 'F'];

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
        bg: 'bg-[var(--accent-soft)]',
        border: 'border-[var(--accent-default)]',
        text: 'text-[var(--accent-active)]'
    },
    {
        bg: 'bg-[var(--brand-soft)]',
        border: 'border-[var(--brand-default)]',
        text: 'text-[var(--brand-default)]'
    },
    {
        bg: 'bg-[var(--status-info-soft)]',
        border: 'border-[var(--status-info)]',
        text: 'text-[var(--status-info)]'
    },
    {
        bg: 'bg-[var(--status-open-soft)]',
        border: 'border-[var(--status-open)]',
        text: 'text-[var(--status-open)]'
    },
    {
        bg: 'bg-[var(--status-warn-soft)]',
        border: 'border-[var(--status-warn)]',
        text: 'text-[var(--status-warn)]'
    }
];

const colorFor = (courseId: string): (typeof SECTION_PALETTE)[number] => {
    let hash = 0;
    for (const ch of courseId) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return SECTION_PALETTE[Math.abs(hash) % SECTION_PALETTE.length] ?? SECTION_PALETTE[0]!;
};

const HOUR_HEIGHT = 56;
const DEFAULT_FIRST_HOUR = 8;
const DEFAULT_LAST_HOUR = 21;

export interface WeeklyScheduleGridProps {
    sections: Section[];
    onSectionClick?: (section: Section) => void;
    /** CRNs to highlight as in conflict. */
    conflictCrns?: Set<string>;
}

interface PositionedBlock {
    section: Section;
    day: Weekday;
    startMin: number;
    endMin: number;
    location: string;
    /** Lane within the day (0..N-1) so overlapping blocks render side-by-side. */
    lane: number;
    /** Total lanes used in this block's overlap cluster. */
    lanes: number;
}

/**
 * Greedy lane assignment: sort blocks within a day by startMin, then for
 * each block place it in the lowest-index lane whose previous block has
 * already ended. Within a "cluster" (set of mutually-overlapping blocks),
 * `lanes` is the cluster size so each block knows its width fraction.
 */
const layoutDay = (
    blocks: Omit<PositionedBlock, 'lane' | 'lanes'>[]
): PositionedBlock[] => {
    if (blocks.length === 0) return [];
    const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin);
    const positioned: PositionedBlock[] = [];

    // Group into clusters where each cluster is a maximal set of blocks that
    // mutually overlap (transitively). Then assign lanes within each cluster.
    let cluster: typeof sorted = [];
    let clusterEnd = -1;
    const flush = (): void => {
        if (cluster.length === 0) return;
        // Assign each block to the smallest lane index where it doesn't
        // conflict with that lane's previous block.
        const laneEnds: number[] = [];
        const laneFor = new Map<typeof cluster[number], number>();
        for (const b of cluster) {
            let assigned = -1;
            for (let i = 0; i < laneEnds.length; i++) {
                if ((laneEnds[i] ?? 0) <= b.startMin) {
                    assigned = i;
                    laneEnds[i] = b.endMin;
                    break;
                }
            }
            if (assigned === -1) {
                assigned = laneEnds.length;
                laneEnds.push(b.endMin);
            }
            laneFor.set(b, assigned);
        }
        const total = laneEnds.length;
        for (const b of cluster) {
            positioned.push({
                ...b,
                lane: laneFor.get(b) ?? 0,
                lanes: total
            });
        }
        cluster = [];
        clusterEnd = -1;
    };

    for (const b of sorted) {
        if (cluster.length === 0 || b.startMin < clusterEnd) {
            cluster.push(b);
            clusterEnd = Math.max(clusterEnd, b.endMin);
        } else {
            flush();
            cluster.push(b);
            clusterEnd = b.endMin;
        }
    }
    flush();
    return positioned;
};

export const WeeklyScheduleGrid = ({
    sections,
    onSectionClick,
    conflictCrns
}: WeeklyScheduleGridProps) => {
    // Compute days, time bounds, and laid-out blocks together so the grid
    // adapts to whatever schedule the user has saved.
    const { days, firstHour, lastHour, blocksByDay, onlineSections } = useMemo(() => {
        const usedDays = new Set<Weekday>(DEFAULT_DAYS);
        let earliest = DEFAULT_FIRST_HOUR * 60;
        let latest = DEFAULT_LAST_HOUR * 60;
        const flat: Omit<PositionedBlock, 'lane' | 'lanes'>[] = [];
        for (const section of sections) {
            for (const m of section.meetings) {
                for (const day of m.days) {
                    usedDays.add(day);
                    flat.push({
                        section,
                        day,
                        startMin: m.startMin,
                        endMin: m.endMin,
                        location: m.location
                    });
                    earliest = Math.min(earliest, m.startMin);
                    latest = Math.max(latest, m.endMin);
                }
            }
        }
        // Snap to whole hours and pad the bottom 30 min so the last block has air.
        const fH = Math.floor(earliest / 60);
        const lH = Math.ceil((latest + 30) / 60);
        // Order weekdays Sun..Sat then map to our enum order. We display
        // M-F (and S/U if used) in calendar order.
        const dayOrder: Weekday[] = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
        const days = dayOrder.filter((d) => usedDays.has(d));
        const blocksByDay = new Map<Weekday, PositionedBlock[]>();
        for (const day of days) {
            blocksByDay.set(day, layoutDay(flat.filter((b) => b.day === day)));
        }
        const onlineSections = sections.filter((s) =>
            s.meetings.every((m) => m.days.length === 0)
        );
        return { days, firstHour: fH, lastHour: lH, blocksByDay, onlineSections };
    }, [sections]);

    if (sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 px-8 space-y-4 border border-dashed border-[var(--border-default)] rounded-2xl bg-[var(--surface-muted)]">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-soft)] flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-[var(--brand-default)]" />
                </div>
                <div>
                    <h3 className="text-[16px] font-bold text-[var(--ink-strong)]">
                        Build your weekly view
                    </h3>
                    <p className="text-[13px] text-[var(--ink-muted)] mt-1">
                        Add sections from Explore and they'll plot here automatically.
                    </p>
                </div>
            </div>
        );
    }

    const hours: number[] = [];
    for (let h = firstHour; h <= lastHour; h++) hours.push(h);
    const gridHeight = (hours.length - 1) * HOUR_HEIGHT;
    const hasAnyMeeting = Array.from(blocksByDay.values()).some((bs) => bs.length > 0);

    // CSS grid template — 64px gutter + N day columns of equal width.
    const gridTemplateColumns = `64px repeat(${days.length}, minmax(0, 1fr))`;

    return (
        <div className="space-y-4">
            <div
                className="grid border border-[var(--border-default)] rounded-2xl bg-[var(--surface-default)] overflow-hidden"
                style={{ gridTemplateColumns }}
            >
                {/* Column headers row */}
                <div className="border-b border-[var(--border-default)] bg-[var(--surface-muted)]" />
                {days.map((d) => (
                    <div
                        key={d}
                        className="border-b border-l border-[var(--border-default)] bg-[var(--surface-muted)] py-3 text-center"
                    >
                        <div className="utsa-eyebrow text-[var(--ink-subtle)]">
                            {DAY_HEADER_LABEL[d].abbr}
                        </div>
                        <div className="utsa-display text-[12px] text-[var(--ink-strong)] mt-0.5">
                            {DAY_HEADER_LABEL[d].full}
                        </div>
                    </div>
                ))}

                {/* Time gutter */}
                <div className="relative" style={{ height: gridHeight }}>
                    {hours.map((h, i) => (
                        <div
                            key={h}
                            className="absolute left-0 right-0 utsa-mono text-[10px] text-[var(--ink-subtle)] pr-2 text-right"
                            style={{ top: i * HOUR_HEIGHT - 6 }}
                        >
                            {formatTimeOfDay(h * 60)}
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {days.map((day) => {
                    const blocks = blocksByDay.get(day) ?? [];
                    return (
                        <div
                            key={day}
                            className="relative border-l border-[var(--border-default)]"
                            style={{ height: gridHeight }}
                        >
                            {hours.map((h, i) => (
                                <div
                                    key={h}
                                    className="absolute left-0 right-0 border-t border-(--border-default)/50"
                                    style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                                />
                            ))}
                            {blocks.map((b) => {
                                const startHr = b.startMin / 60;
                                const endHr = b.endMin / 60;
                                const top = (startHr - firstHour) * HOUR_HEIGHT;
                                const height = (endHr - startHr) * HOUR_HEIGHT;
                                if (top < -8 || top > gridHeight) return null;
                                const c = colorFor(b.section.courseId);
                                const isConflict = conflictCrns?.has(b.section.crn) ?? false;
                                const widthPct = 100 / b.lanes;
                                const leftPct = b.lane * widthPct;
                                return (
                                    <button
                                        type="button"
                                        key={`${b.section.crn}-${day}-${b.lane}`}
                                        onClick={() => {
                                            onSectionClick?.(b.section);
                                        }}
                                        className={cn(
                                            'absolute rounded-lg border-l-[3px] px-2 py-1 text-left',
                                            'transition-all hover:shadow-md hover:-translate-y-px',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)/55',
                                            c.bg,
                                            c.border,
                                            c.text,
                                            isConflict && 'ring-2 ring-(--status-danger)/60'
                                        )}
                                        style={{
                                            top: top + 2,
                                            height: Math.max(height - 4, 24),
                                            left: `calc(${leftPct}% + 2px)`,
                                            width: `calc(${widthPct}% - 4px)`
                                        }}
                                    >
                                        <div className="utsa-mono text-[11px] font-bold leading-tight truncate">
                                            {b.section.courseId}
                                        </div>
                                        <div className="text-[9px] leading-tight opacity-80 truncate">
                                            §{b.section.sectionCode}
                                            {b.location && b.lanes === 1
                                                ? ` · ${b.location}`
                                                : ''}
                                        </div>
                                        <div className="utsa-mono text-[9px] leading-tight opacity-70">
                                            {formatTimeOfDay(b.startMin, true)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {!hasAnyMeeting && (
                <p className="text-[12px] text-[var(--ink-muted)] text-center">
                    All sections are online — nothing to plot.
                </p>
            )}
            {onlineSections.length > 0 && hasAnyMeeting && (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-muted)] px-4 py-2 text-[12px] text-[var(--ink-muted)]">
                    <span className="font-semibold text-[var(--ink-strong)]">
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
