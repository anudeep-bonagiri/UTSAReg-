import {
    Star,
    FileText,
    ExternalLink,
    MapPin,
    Clock,
    Users,
    Calendar,
    Building2
} from 'lucide-react';
import {
    Badge,
    Button,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogRoot,
    DialogTitle,
    FreshnessChip
} from '@utsaregplus/ui';
import { formatDays, formatTimeRange, type Course, type Section } from '@utsaregplus/core';
import { useRmpRating } from '../hooks/useRmpRating.js';
import { useSyllabusContext } from '../hooks/useSyllabusContext.js';

interface CourseDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    section: Section | null;
    course: Course | undefined;
    onAdd?: (s: Section) => void;
    onSave?: (s: Section) => void;
    saved: boolean;
}

export const CourseDetailDialog = ({
    open,
    onOpenChange,
    section,
    course,
    onAdd,
    onSave,
    saved
}: CourseDetailDialogProps) => {
    const rmp = useRmpRating(section?.instructorName);
    const syllabus = useSyllabusContext(section?.courseId);

    if (!section) return null;

    const meeting = section.meetings[0];
    const r = rmp.data?.data;
    const ratingTone = r
        ? r.avgRating >= 4
            ? 'open'
            : r.avgRating >= 3
              ? 'warn'
              : 'danger'
        : 'neutral';

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {/* Midnight header — strongest UTSA brand cue at the most-seen moment */}
                <div className="relative bg-[--brand-default] text-white px-6 pt-6 pb-5">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[--accent-default]" />
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[--accent-default]" />
                        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-[--brand-soft]">
                            Course detail · {section.termId.slice(0, 4)} term
                        </span>
                    </div>
                    <DialogTitle className="utsa-display-black text-white text-[26px] leading-tight">
                        <span className="utsa-tabular">{section.courseId}</span>
                        <span className="text-[--accent-default] mx-2">·</span>
                        <span>{course?.title ?? section.title}</span>
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-[12px] text-[--brand-soft]">
                        Section §{section.sectionCode} · CRN{' '}
                        <span className="utsa-tabular font-bold text-white">{section.crn}</span> ·{' '}
                        {section.creditHours ?? 3} credit hours
                    </DialogDescription>
                </div>

                <DialogBody className="space-y-6">
                    {/* Instructor + RMP */}
                    <section className="rounded-xl border border-[--border-default] bg-[--surface-default] p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[--brand-soft] text-[--brand-default] flex items-center justify-center font-bold">
                                    {section.instructorName
                                        .split(/[, ]+/)
                                        .slice(0, 2)
                                        .map((p) => p[0])
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[14px] font-bold text-[--ink-strong]">
                                        {section.instructorName}
                                    </div>
                                    <div className="text-[12px] text-[--ink-muted]">
                                        Instructor · UTSA
                                    </div>
                                </div>
                            </div>
                            {rmp.data && <FreshnessChip freshness={rmp.data.freshness} />}
                        </div>

                        {rmp.loading ? (
                            <div className="h-12 bg-[--surface-muted] rounded-lg animate-pulse" />
                        ) : r && r.numRatings > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-[--surface-muted] p-3">
                                    <div className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                        Rating
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <Star
                                            className={`w-4 h-4 fill-current ${
                                                ratingTone === 'open'
                                                    ? 'text-[--status-open]'
                                                    : ratingTone === 'warn'
                                                      ? 'text-[--status-warn]'
                                                      : 'text-[--status-danger]'
                                            }`}
                                        />
                                        <span className="text-[20px] font-black text-[--ink-strong] utsa-tabular">
                                            {r.avgRating.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-[--ink-muted]">/ 5</span>
                                    </div>
                                    <div className="text-[10px] text-[--ink-muted] mt-1">
                                        {r.numRatings} reviews
                                    </div>
                                </div>
                                <div className="rounded-xl bg-[--surface-muted] p-3">
                                    <div className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                        Difficulty
                                    </div>
                                    <div className="text-[20px] font-black text-[--ink-strong] utsa-tabular mt-1">
                                        {r.avgDifficulty?.toFixed(1) ?? '—'}
                                    </div>
                                    <div className="text-[10px] text-[--ink-muted] mt-1">/ 5</div>
                                </div>
                                <div className="rounded-xl bg-[--surface-muted] p-3">
                                    <div className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                        Retake
                                    </div>
                                    <div className="text-[20px] font-black text-[--ink-strong] utsa-tabular mt-1">
                                        {r.wouldTakeAgainPercent !== undefined
                                            ? `${Math.round(r.wouldTakeAgainPercent)}%`
                                            : '—'}
                                    </div>
                                    <div className="text-[10px] text-[--ink-muted] mt-1">
                                        would take again
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[12px] text-[--ink-muted]">
                                No RateMyProfessor reviews found for this instructor.
                            </p>
                        )}
                    </section>

                    {/* Schedule */}
                    <section className="rounded-xl border border-[--border-default] bg-[--surface-default] p-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold mb-3">
                            When + Where
                        </h4>
                        {meeting ? (
                            <div className="grid grid-cols-3 gap-3 text-[12px]">
                                <Stat
                                    icon={Calendar}
                                    label="Days"
                                    value={formatDays(meeting.days)}
                                />
                                <Stat
                                    icon={Clock}
                                    label="Time"
                                    value={formatTimeRange(meeting.startMin, meeting.endMin)}
                                />
                                <Stat
                                    icon={MapPin}
                                    label="Location"
                                    value={meeting.location || '—'}
                                />
                            </div>
                        ) : (
                            <p className="text-[12px] text-[--ink-muted]">
                                {section.modality === 'online_async'
                                    ? 'Online (asynchronous) — no scheduled meetings.'
                                    : 'No meeting time scheduled.'}
                            </p>
                        )}
                    </section>

                    {/* Course description */}
                    {course?.description && (
                        <section className="rounded-xl border border-[--border-default] bg-[--surface-default] p-4">
                            <h4 className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold mb-2">
                                Description
                            </h4>
                            <p className="text-[12px] leading-relaxed text-[--ink-default]">
                                {course.description}
                            </p>
                            {course.prereqsRaw && (
                                <p className="text-[11px] mt-2 text-[--ink-muted]">
                                    <span className="font-semibold">Prerequisites: </span>
                                    {course.prereqsRaw}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Enrollment */}
                    {section.capacity !== undefined && section.enrolled !== undefined && (
                        <section className="rounded-xl border border-[--border-default] bg-[--surface-default] p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[--ink-muted]" />
                                    <span className="text-[12px] font-semibold text-[--ink-strong] utsa-tabular">
                                        {section.enrolled} / {section.capacity} seats
                                    </span>
                                </div>
                                <Badge
                                    tone={
                                        section.status === 'open'
                                            ? 'open'
                                            : section.status === 'waitlist'
                                              ? 'warn'
                                              : 'danger'
                                    }
                                    withDot
                                    size="md"
                                >
                                    {section.status}
                                </Badge>
                            </div>
                            {section.waitlistCount !== undefined && section.waitlistCount > 0 && (
                                <p className="text-[11px] text-[--ink-muted] mt-2">
                                    {section.waitlistCount} student
                                    {section.waitlistCount === 1 ? '' : 's'} on waitlist
                                </p>
                            )}
                        </section>
                    )}

                    {/* Syllabus library — live data from Simple Syllabus */}
                    <section className="rounded-xl border border-[--border-default] bg-[--surface-default] p-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[--accent-default]" />
                                <h4 className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                    Syllabus Library
                                </h4>
                            </div>
                            {syllabus.data && (
                                <FreshnessChip
                                    freshness={{
                                        source: 'live',
                                        fetchedAt: syllabus.data.fetchedAt,
                                        maxAgeMs: 6 * 60 * 60 * 1000
                                    }}
                                    timeOnly
                                />
                            )}
                        </div>
                        {syllabus.loading ? (
                            <div className="h-12 bg-[--surface-muted] rounded-lg animate-pulse" />
                        ) : syllabus.data ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[12px] text-[--ink-default]">
                                    <Building2 className="w-3.5 h-3.5 text-[--ink-muted]" />
                                    <span className="font-semibold">
                                        {syllabus.data.departmentName}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-[--surface-muted] p-2.5">
                                        <div className="text-[9px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                            Tracked courses
                                        </div>
                                        <div className="text-[18px] font-black text-[--ink-strong] utsa-tabular leading-tight mt-0.5">
                                            {syllabus.data.courseCount}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-[--surface-muted] p-2.5">
                                        <div className="text-[9px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                            Sections published
                                        </div>
                                        <div className="text-[18px] font-black text-[--ink-strong] utsa-tabular leading-tight mt-0.5">
                                            {syllabus.data.sectionCount}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={syllabus.data.libraryUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-[--border-default] bg-[--surface-default] hover:bg-[--surface-muted] p-2.5 text-[12px] font-semibold text-[--ink-strong] transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5 text-[--accent-default]" />
                                    <span>Open syllabi for {section.courseId}</span>
                                    <ExternalLink className="w-3 h-3 ml-auto text-[--ink-muted]" />
                                </a>
                            </div>
                        ) : (
                            <p className="text-[12px] text-[--ink-muted]">
                                {syllabus.error
                                    ? `Could not reach Simple Syllabus: ${syllabus.error}`
                                    : 'No syllabus data published for this department yet.'}
                            </p>
                        )}
                    </section>

                    {/* External links */}
                    {r && (
                        <section>
                            <a
                                href={`https://www.ratemyprofessors.com/professor/${r.legacyId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-xl border border-[--border-default] bg-[--surface-default] hover:bg-[--surface-muted] p-3 text-[12px] font-semibold text-[--ink-strong] transition-colors"
                            >
                                <Star className="w-4 h-4 text-[--accent-default]" />
                                <span>Open {section.instructorName} on RateMyProfessors</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-[--ink-muted]" />
                            </a>
                        </section>
                    )}
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onSave?.(section);
                        }}
                    >
                        {saved ? 'Saved' : 'Save for later'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onAdd?.(section);
                            onOpenChange(false);
                        }}
                        disabled={section.status === 'closed'}
                    >
                        Add to schedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

interface StatProps {
    icon: typeof Calendar;
    label: string;
    value: string;
}

const Stat = ({ icon: Icon, label, value }: StatProps) => (
    <div className="rounded-lg bg-[--surface-muted] p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
            <Icon className="w-3 h-3" />
            {label}
        </div>
        <div className="text-[13px] font-bold text-[--ink-strong] mt-1 utsa-tabular truncate">
            {value}
        </div>
    </div>
);
