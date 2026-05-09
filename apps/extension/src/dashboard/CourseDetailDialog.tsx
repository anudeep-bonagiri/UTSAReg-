import { Star, FileText, ExternalLink, MapPin, Clock, Users, Calendar } from 'lucide-react';
import {
    Badge,
    Button,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    FreshnessChip
} from '@utsaregplus/ui';
import {
    formatDays,
    formatTimeRange,
    type Course,
    type Section
} from '@utsaregplus/core';
import { useRmpRating } from '../hooks/useRmpRating.js';

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
                <DialogHeader>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <DialogTitle>
                                <span className="utsa-tabular">{section.courseId}</span>
                                <span className="text-[--ink-muted] mx-2">·</span>
                                <span>{course?.title ?? section.title}</span>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Section §{section.sectionCode} · CRN{' '}
                                <span className="utsa-tabular font-semibold text-[--ink-default]">
                                    {section.crn}
                                </span>{' '}
                                · {section.creditHours ?? 3} credit hours
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

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
                            {rmp.data && (
                                <FreshnessChip freshness={rmp.data.freshness} />
                            )}
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
                                        <span className="text-[10px] text-[--ink-muted]">
                                            / 5
                                        </span>
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
                                    <div className="text-[10px] text-[--ink-muted] mt-1">
                                        / 5
                                    </div>
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
                                <Stat icon={Calendar} label="Days" value={formatDays(meeting.days)} />
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

                    {/* External links */}
                    <section className="grid grid-cols-2 gap-3">
                        <a
                            href={`https://utsa.simplesyllabus.com/en-US/syllabus-library?query=${encodeURIComponent(section.courseId.replace(/(\d)/, ' $1'))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-[--border-default] bg-[--surface-default] hover:bg-[--surface-muted] p-3 text-[12px] font-semibold text-[--ink-strong] transition-colors"
                        >
                            <FileText className="w-4 h-4 text-[--accent-default]" />
                            <span>View past syllabi</span>
                            <ExternalLink className="w-3 h-3 ml-auto text-[--ink-muted]" />
                        </a>
                        {r && (
                            <a
                                href={`https://www.ratemyprofessors.com/professor/${r.legacyId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-xl border border-[--border-default] bg-[--surface-default] hover:bg-[--surface-muted] p-3 text-[12px] font-semibold text-[--ink-strong] transition-colors"
                            >
                                <Star className="w-4 h-4 text-[--accent-default]" />
                                <span>Open on RMP</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-[--ink-muted]" />
                            </a>
                        )}
                    </section>
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
