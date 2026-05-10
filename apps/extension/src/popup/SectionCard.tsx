import { useMemo } from 'react';
import {
    Star,
    Users,
    MapPin,
    Clock,
    Calendar as CalIcon,
    Bookmark,
    ExternalLink,
    Loader2,
    Radio
} from 'lucide-react';
import { Badge, Button, Card, FreshnessChip, Tooltip, cn } from '@utsaregplus/ui';
import {
    formatDays,
    formatRelativeFreshness,
    formatTimeRange,
    type Course,
    type Section
} from '@utsaregplus/core';
import { useRmpRating } from '../hooks/useRmpRating.js';

interface SectionCardProps {
    section: Section;
    course: Course | undefined;
    saved: boolean;
    inConflict: boolean;
    /**
     * ISO timestamp of the last live ASAP refresh for this section's subject.
     * undefined = no live data yet (showing snapshot).
     */
    subjectFetchedAt?: string;
    /** True while a refresh for this subject is in flight. */
    refreshing?: boolean;
    onAdd: (section: Section) => void;
    onSave: (section: Section) => void;
    onOpen: (section: Section) => void;
}

/** Seat counts older than 5 minutes are flagged stale during peak windows. */
const SEAT_STALE_THRESHOLD_MS = 5 * 60 * 1000;

const STATUS_TONE: Record<Section['status'], 'open' | 'warn' | 'danger' | 'neutral'> = {
    open: 'open',
    waitlist: 'warn',
    closed: 'danger',
    cancelled: 'neutral'
};

const STATUS_LABEL: Record<Section['status'], string> = {
    open: 'Open',
    waitlist: 'Waitlist',
    closed: 'Closed',
    cancelled: 'Cancelled'
};

const MODALITY_LABEL: Record<Section['modality'], string | null> = {
    in_person: null,
    online_async: 'Online (async)',
    online_sync: 'Online (live)',
    hybrid: 'Hybrid',
    unspecified: null
};

export const SectionCard = ({
    section,
    course,
    saved,
    inConflict,
    subjectFetchedAt,
    refreshing,
    onAdd,
    onSave,
    onOpen
}: SectionCardProps) => {
    const rmp = useRmpRating(section.instructorName);
    const meeting = section.meetings[0];

    const seatPct = useMemo(() => {
        if (!section.capacity || !section.enrolled) return null;
        return Math.min(100, Math.round((section.enrolled / section.capacity) * 100));
    }, [section.capacity, section.enrolled]);

    const seatFreshness = useMemo(() => {
        if (!subjectFetchedAt) {
            return { live: false, ageMs: Infinity, isStale: true } as const;
        }
        const ageMs = Date.now() - new Date(subjectFetchedAt).getTime();
        return {
            live: true,
            ageMs,
            isStale: ageMs > SEAT_STALE_THRESHOLD_MS
        } as const;
    }, [subjectFetchedAt]);

    const ratingBadge = (() => {
        if (rmp.loading) {
            // Compact rating skeleton — same footprint as the populated chip
            // so layout doesn't reflow when data lands.
            return (
                <span
                    aria-label="Loading RateMyProfessor rating"
                    aria-busy="true"
                    className="inline-flex items-center gap-1.5"
                >
                    <span className="w-3 h-3 rounded-full bg-[var(--surface-sunken)] animate-pulse" />
                    <span className="h-2.5 w-7 rounded-full bg-[var(--surface-sunken)] animate-pulse" />
                    <span className="h-2.5 w-9 rounded-full bg-[var(--surface-sunken)] animate-pulse" />
                </span>
            );
        }
        if (!rmp.data || rmp.data.data.numRatings === 0) {
            return <span className="text-[var(--ink-subtle)] text-[11px]">No RMP data</span>;
        }
        const r = rmp.data.data;
        const tone = r.avgRating >= 4 ? 'open' : r.avgRating >= 3 ? 'warn' : 'danger';
        return (
            <Tooltip
                content={
                    <div className="text-[11px] leading-tight">
                        <div className="font-bold">
                            {r.avgRating.toFixed(2)}★ on RateMyProfessors
                        </div>
                        <div className="text-white/70">
                            {r.numRatings} reviews
                            {r.avgDifficulty !== undefined &&
                                ` · ${r.avgDifficulty.toFixed(1)} difficulty`}
                            {r.wouldTakeAgainPercent !== undefined &&
                                ` · ${Math.round(r.wouldTakeAgainPercent)}% retake`}
                        </div>
                    </div>
                }
            >
                <span
                    className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-semibold cursor-help',
                        tone === 'open' && 'text-[var(--status-open)]',
                        tone === 'warn' && 'text-[var(--status-warn)]',
                        tone === 'danger' && 'text-[var(--status-danger)]'
                    )}
                >
                    <Star className="w-3 h-3 fill-current" />
                    {r.avgRating.toFixed(1)}
                    <span className="text-[var(--ink-subtle)] font-normal">({r.numRatings})</span>
                </span>
            </Tooltip>
        );
    })();

    return (
        <Card
            elevation={inConflict ? 'flat' : 'low'}
            padding="md"
            className={cn(
                'relative overflow-hidden transition-opacity',
                'border-l-[3px] border-l-[var(--accent-default)]',
                inConflict &&
                    'opacity-60 line-through decoration-(--status-danger)/30 border-l-[var(--status-danger)]'
            )}
        >
            {/* Header row */}
            <button
                type="button"
                onClick={() => {
                    onOpen(section);
                }}
                className="w-full text-left flex items-start justify-between gap-2 mb-2 hover:opacity-80 transition-opacity"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="utsa-mono text-[13px] font-bold text-[var(--ink-strong)]">
                            {section.courseId.slice(0, -4)} {section.courseId.slice(-4)}
                        </span>
                        <span className="utsa-mono text-[10px] tracking-wider text-[var(--ink-subtle)] font-bold">
                            §{section.sectionCode}
                        </span>
                        <Badge tone={STATUS_TONE[section.status]} size="sm" withDot>
                            {STATUS_LABEL[section.status]}
                        </Badge>
                    </div>
                    <h3 className="utsa-display text-[14px] font-medium text-[var(--ink-strong)] mt-1 truncate leading-tight">
                        {course?.title ?? section.title}
                    </h3>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-subtle)] shrink-0 mt-1" />
            </button>

            {/* Instructor + RMP */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-soft)] text-[var(--brand-default)] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {section.instructorName
                            .split(/[, ]+/)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase()}
                    </div>
                    <span className="text-[12px] text-[var(--ink-default)] truncate">
                        {section.instructorName}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {ratingBadge}
                    {rmp.data && <FreshnessChip freshness={rmp.data.freshness} timeOnly />}
                </div>
            </div>

            {/* Schedule line */}
            <div className="flex items-center gap-3 text-[11px] text-[var(--ink-muted)] mb-3 utsa-tabular">
                {meeting ? (
                    <>
                        <span className="inline-flex items-center gap-1">
                            <CalIcon className="w-3 h-3" />
                            <strong className="text-[var(--ink-default)]">
                                {formatDays(meeting.days)}
                            </strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRange(meeting.startMin, meeting.endMin)}
                        </span>
                        {meeting.location && (
                            <span className="inline-flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" />
                                {meeting.location}
                            </span>
                        )}
                    </>
                ) : MODALITY_LABEL[section.modality] ? (
                    <span className="inline-flex items-center gap-1 text-[var(--status-info)]">
                        <Clock className="w-3 h-3" /> {MODALITY_LABEL[section.modality]}
                    </span>
                ) : (
                    <span className="text-[var(--ink-subtle)]">No meeting time scheduled</span>
                )}
            </div>

            {/* Seats + actions */}
            <div className="flex items-center justify-between gap-2">
                <div
                    className={cn(
                        'flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)] utsa-tabular min-w-0',
                        seatFreshness.isStale && 'opacity-70'
                    )}
                >
                    <Users className="w-3 h-3 shrink-0" />
                    {section.enrolled !== undefined && section.capacity !== undefined ? (
                        <>
                            <span>
                                <strong className="text-[var(--ink-default)]">
                                    {section.enrolled}
                                </strong>
                                /{section.capacity}
                            </span>
                            {seatPct !== null && (
                                <div className="w-12 h-1.5 bg-[var(--surface-sunken)] rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full',
                                            seatPct >= 90
                                                ? 'bg-[var(--status-danger)]'
                                                : seatPct >= 70
                                                  ? 'bg-[var(--status-warn)]'
                                                  : 'bg-[var(--status-open)]'
                                        )}
                                        style={{ width: `${seatPct}%` }}
                                    />
                                </div>
                            )}
                            {/* Per-section live/stale indicator. The seat
                                counts above are only as fresh as this chip. */}
                            {refreshing ? (
                                <Tooltip content="Re-checking ASAP for live seat counts…">
                                    <span className="inline-flex items-center gap-1 text-[var(--status-info)]">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-[10px]">Refreshing</span>
                                    </span>
                                </Tooltip>
                            ) : seatFreshness.live ? (
                                <Tooltip
                                    content={
                                        seatFreshness.isStale
                                            ? `Seat data verified ${formatRelativeFreshness(subjectFetchedAt!)} — open ASAP for instant live counts.`
                                            : `Seat data verified ${formatRelativeFreshness(subjectFetchedAt!)}.`
                                    }
                                >
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 text-[10px] font-bold tracking-wide',
                                            seatFreshness.isStale
                                                ? 'text-[var(--status-warn)]'
                                                : 'text-[var(--status-open)]'
                                        )}
                                    >
                                        <Radio className="w-3 h-3" />
                                        {seatFreshness.isStale ? 'CHECK ASAP' : 'LIVE'}
                                    </span>
                                </Tooltip>
                            ) : null}
                        </>
                    ) : (
                        <span className="text-[var(--ink-subtle)]">No seat data</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip content={saved ? 'Already saved' : 'Save for later'}>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={saved ? 'Saved' : 'Save course'}
                            onClick={() => {
                                onSave(section);
                            }}
                            className={cn(saved && 'text-[var(--accent-default)]')}
                        >
                            <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
                        </Button>
                    </Tooltip>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                            onAdd(section);
                        }}
                        disabled={inConflict || section.status === 'closed'}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </Card>
    );
};
