import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    Calendar,
    Bookmark,
    Settings,
    Sun,
    Moon,
    Sparkles,
    PlaneTakeoff,
    Shield,
    Trash2,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { Button, Card, FreshnessChip, Input, TooltipProvider, cn } from '@utsaregplus/ui';
import {
    findConflictsAgainst,
    formatDays,
    formatTimeRange,
    totalCreditHours,
    type Section
} from '@utsaregplus/core';
import {
    ALL_COURSES,
    ALL_SECTIONS,
    SECTIONS_FETCHED_AT,
    SECTIONS_TERM_LABEL
} from '../data/index.js';
import { SectionCard } from '../popup/SectionCard.js';
import { usePersistedSchedule } from '../hooks/usePersistedSchedule.js';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid.js';
import { CourseDetailDialog } from './CourseDetailDialog.js';

type Tab = 'explore' | 'schedule' | 'saved' | 'settings';

const courseById = new Map(ALL_COURSES.map((c) => [c.id, c]));
const sectionByCrn = new Map(ALL_SECTIONS.map((s) => [s.crn, s]));

const sectionsFreshness = {
    source: 'snapshot' as const,
    fetchedAt: SECTIONS_FETCHED_AT
};

interface UserPrefs {
    theme: 'light' | 'dark';
    f1Mode: boolean;
    gpaProtect: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
    theme: 'light',
    f1Mode: false,
    gpaProtect: false
};

const PREFS_KEY = 'prefs:v1';

const usePrefs = () => {
    const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
    useEffect(() => {
        chrome.storage.sync
            .get(PREFS_KEY)
            .then((result) => {
                const stored = result[PREFS_KEY] as Partial<UserPrefs> | undefined;
                const merged = { ...DEFAULT_PREFS, ...(stored ?? {}) };
                setPrefs(merged);
                document.documentElement.dataset.theme = merged.theme;
            })
            .catch(() => {
                /* keep defaults */
            });
    }, []);
    const update = (patch: Partial<UserPrefs>): void => {
        const next = { ...prefs, ...patch };
        setPrefs(next);
        if (patch.theme) document.documentElement.dataset.theme = patch.theme;
        void chrome.storage.sync.set({ [PREFS_KEY]: next });
    };
    return { prefs, update };
};

export const App = () => {
    const { prefs, update } = usePrefs();
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [query, setQuery] = useState('');
    const [openDialogCrn, setOpenDialogCrn] = useState<string | null>(null);
    const { crns, saved, addSection, removeSection, toggleSaved, hydrated } =
        usePersistedSchedule();

    useEffect(() => {
        const m = /#course=([A-Z0-9]+)/.exec(window.location.hash);
        if (m?.[1]) {
            const first = ALL_SECTIONS.find((s) => s.courseId === m[1]);
            if (first) setOpenDialogCrn(first.crn);
        }
    }, []);

    const committed = useMemo<Section[]>(
        () => crns.map((c) => sectionByCrn.get(c)).filter((s): s is Section => Boolean(s)),
        [crns]
    );

    const sourceSections = useMemo<Section[]>(() => {
        let pool = ALL_SECTIONS;
        if (prefs.f1Mode) {
            pool = pool.filter((s) => s.modality !== 'online_async');
        }
        return pool;
    }, [prefs.f1Mode]);

    const visibleResults = useMemo<Section[]>(() => {
        const q = query.trim().toLowerCase();
        if (q.length === 0) return [];
        return sourceSections.filter((s) => {
            const course = courseById.get(s.courseId);
            return (
                s.crn.includes(q) ||
                s.courseId.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q) ||
                s.instructorName.toLowerCase().includes(q) ||
                (course?.title.toLowerCase().includes(q) ?? false)
            );
        });
    }, [sourceSections, query]);

    const conflictSet = useMemo(
        () => findConflictsAgainst(committed, visibleResults),
        [committed, visibleResults]
    );

    const totalCredits = totalCreditHours(committed);
    const inPersonCredits = totalCreditHours(
        committed.filter((s) => s.modality !== 'online_async')
    );

    const handleAdd = (section: Section): void => {
        addSection(section.crn);
    };

    const handleSave = (section: Section): void => {
        toggleSaved(section.crn);
    };

    const dialogSection = openDialogCrn ? (sectionByCrn.get(openDialogCrn) ?? null) : null;

    return (
        <TooltipProvider delayDuration={250}>
            <div className="flex h-screen w-screen bg-[--surface-canvas] text-[--ink-default] overflow-hidden">
                <aside className="w-60 border-r border-[--border-default] bg-[--surface-default] flex flex-col">
                    <div className="p-5 border-b border-[--border-default]">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[--accent-default] flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-[16px] font-bold text-[--ink-strong] leading-tight tracking-tight">
                                    UTSA Reg<span className="text-[--accent-default]">+</span>
                                </div>
                                <div className="text-[10px] text-[--ink-subtle] uppercase tracking-wider font-semibold">
                                    {SECTIONS_TERM_LABEL}
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-3 space-y-1">
                        {(
                            [
                                { id: 'explore', icon: BookOpen, label: 'Course Explorer' },
                                { id: 'schedule', icon: Calendar, label: 'Weekly Schedule' },
                                { id: 'saved', icon: Bookmark, label: 'Saved' },
                                { id: 'settings', icon: Settings, label: 'Settings' }
                            ] as { id: Tab; icon: typeof BookOpen; label: string }[]
                        ).map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(item.id);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors',
                                        isActive
                                            ? 'bg-[--accent-soft] text-[--accent-active]'
                                            : 'text-[--ink-default] hover:bg-[--surface-muted]'
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                    {item.id === 'schedule' && committed.length > 0 && (
                                        <span className="ml-auto utsa-tabular text-[10px] bg-[--accent-default] text-white px-1.5 py-0.5 rounded-full">
                                            {committed.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-3 border-t border-[--border-default] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
                                Theme
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    update({
                                        theme: prefs.theme === 'light' ? 'dark' : 'light'
                                    });
                                }}
                                aria-label="Toggle theme"
                            >
                                {prefs.theme === 'light' ? (
                                    <Moon className="w-4 h-4" />
                                ) : (
                                    <Sun className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <FreshnessChip freshness={sectionsFreshness} />
                    </div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="px-8 py-4 border-b border-[--border-default] bg-[--surface-default] flex items-center gap-4">
                        <div className="flex-1">
                            <h2 className="text-[20px] font-bold text-[--ink-strong] tracking-tight">
                                {activeTab === 'explore' && 'Course Explorer'}
                                {activeTab === 'schedule' && 'Weekly Schedule'}
                                {activeTab === 'saved' && 'Saved Courses'}
                                {activeTab === 'settings' && 'Settings'}
                            </h2>
                            <p className="text-[12px] text-[--ink-muted] mt-0.5">
                                {activeTab === 'explore' &&
                                    'Search live UTSA sections with RateMyProfessor and grade-history overlays.'}
                                {activeTab === 'schedule' &&
                                    'Drag-free weekly grid built from your selected sections.'}
                                {activeTab === 'saved' &&
                                    'Sections you bookmarked but have not added yet.'}
                                {activeTab === 'settings' &&
                                    'Differentiator modes built for UTSA students.'}
                            </p>
                        </div>
                        {activeTab === 'explore' && (
                            <div className="w-[360px]">
                                <Input
                                    leadingAdornment={<Search />}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                    }}
                                    placeholder="Search 1,400 UTSA courses..."
                                    autoFocus
                                />
                            </div>
                        )}
                    </header>

                    <section className="flex-1 overflow-y-auto p-8 space-y-6">
                        {activeTab === 'explore' && (
                            <ExplorePane
                                results={visibleResults}
                                conflictCrns={conflictSet}
                                committedCrns={crns}
                                savedSet={new Set(saved)}
                                query={query}
                                onAdd={handleAdd}
                                onSave={handleSave}
                                onOpen={(s) => {
                                    setOpenDialogCrn(s.crn);
                                }}
                                f1Mode={prefs.f1Mode}
                            />
                        )}
                        {activeTab === 'schedule' && (
                            <SchedulePane
                                committed={committed}
                                totalCredits={totalCredits}
                                inPersonCredits={inPersonCredits}
                                f1Mode={prefs.f1Mode}
                                hydrated={hydrated}
                                onSectionClick={(s) => {
                                    setOpenDialogCrn(s.crn);
                                }}
                                onRemove={removeSection}
                            />
                        )}
                        {activeTab === 'saved' && (
                            <SavedPane
                                saved={saved}
                                onUnsave={toggleSaved}
                                onAdd={addSection}
                                onOpen={(s) => {
                                    setOpenDialogCrn(s.crn);
                                }}
                            />
                        )}
                        {activeTab === 'settings' && (
                            <SettingsPane prefs={prefs} onChange={update} />
                        )}
                    </section>
                </main>
            </div>

            <CourseDetailDialog
                open={Boolean(openDialogCrn)}
                onOpenChange={(o) => {
                    if (!o) setOpenDialogCrn(null);
                }}
                section={dialogSection}
                course={dialogSection ? courseById.get(dialogSection.courseId) : undefined}
                onAdd={handleAdd}
                onSave={handleSave}
                saved={dialogSection ? saved.includes(dialogSection.crn) : false}
            />
        </TooltipProvider>
    );
};

interface ExplorePaneProps {
    results: Section[];
    conflictCrns: Set<string>;
    committedCrns: string[];
    savedSet: Set<string>;
    query: string;
    onAdd: (s: Section) => void;
    onSave: (s: Section) => void;
    onOpen: (s: Section) => void;
    f1Mode: boolean;
}

const ExplorePane = ({
    results,
    conflictCrns,
    committedCrns,
    savedSet,
    query,
    onAdd,
    onSave,
    onOpen,
    f1Mode
}: ExplorePaneProps) => {
    if (query.trim().length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard
                    icon={LayoutDashboard}
                    title="Real-time RMP"
                    body="Every result fetches live RateMyProfessor ratings. Shows freshness so you know when data was last fetched."
                />
                <FeatureCard
                    icon={Calendar}
                    title="Conflict-aware"
                    body="Add sections and any overlapping search result crosses out automatically — no more registration-day surprises."
                />
                <FeatureCard
                    icon={PlaneTakeoff}
                    title="F1 mode"
                    body="Hide online sections, monitor in-person credit hours, and protect your CPT/OPT eligibility."
                />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-16 text-[14px] text-[--ink-muted]">
                <p>No sections match {`"${query}"`}.</p>
                {f1Mode && (
                    <p className="text-[12px] mt-2">
                        F1 mode is on — try disabling it in Settings if you expected online options.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((section) => (
                <SectionCard
                    key={section.crn}
                    section={section}
                    course={courseById.get(section.courseId)}
                    saved={savedSet.has(section.crn)}
                    inConflict={
                        conflictCrns.has(section.crn) && !committedCrns.includes(section.crn)
                    }
                    onAdd={onAdd}
                    onSave={onSave}
                    onOpen={onOpen}
                />
            ))}
        </div>
    );
};

interface FeatureCardProps {
    icon: typeof Calendar;
    title: string;
    body: string;
}
const FeatureCard = ({ icon: Icon, title, body }: FeatureCardProps) => (
    <Card padding="lg" className="space-y-3">
        <div className="w-10 h-10 rounded-xl bg-[--accent-soft] text-[--accent-default] flex items-center justify-center">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className="text-[15px] font-bold text-[--ink-strong] tracking-tight">{title}</h3>
            <p className="text-[12px] text-[--ink-muted] leading-relaxed mt-1">{body}</p>
        </div>
    </Card>
);

interface SchedulePaneProps {
    committed: Section[];
    totalCredits: number;
    inPersonCredits: number;
    f1Mode: boolean;
    hydrated: boolean;
    onSectionClick: (s: Section) => void;
    onRemove: (crn: string) => void;
}

const SchedulePane = ({
    committed,
    totalCredits,
    inPersonCredits,
    f1Mode,
    hydrated,
    onSectionClick,
    onRemove
}: SchedulePaneProps) => {
    if (!hydrated) return <p className="text-[--ink-muted]">Loading...</p>;

    const f1Insufficient = f1Mode && inPersonCredits < 12;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBlock label="Sections" value={committed.length} />
                <StatBlock label="Credit hours" value={totalCredits} suffix="/ 18" />
                <StatBlock
                    label="In-person credits"
                    value={inPersonCredits}
                    tone={f1Insufficient ? 'warn' : 'default'}
                />
                <StatBlock
                    label="Online sections"
                    value={committed.filter((s) => s.modality === 'online_async').length}
                />
            </div>

            {f1Insufficient && (
                <Card padding="md" className="border-[--status-warn]/40 bg-[--status-warn-soft]">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[--status-warn] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[13px] font-bold text-[--status-warn]">
                                F1 mode: below 12 in-person credit hours
                            </p>
                            <p className="text-[12px] text-[--ink-default] mt-1">
                                International students must maintain ≥12 in-person credits to
                                preserve CPT/OPT eligibility. Add an in-person section or disable F1
                                mode if you have an exception.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <WeeklyScheduleGrid sections={committed} onSectionClick={onSectionClick} />

            {committed.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {committed.map((s) => (
                        <Card key={s.crn} padding="sm" className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-[--ink-strong] utsa-tabular">
                                    {s.courseId} §{s.sectionCode}
                                </p>
                                <p className="text-[11px] text-[--ink-muted] truncate">
                                    {s.title} · {s.instructorName}
                                </p>
                                <p className="text-[11px] text-[--ink-muted] mt-0.5 utsa-tabular">
                                    {s.meetings[0]
                                        ? `${formatDays(s.meetings[0].days)} · ${formatTimeRange(s.meetings[0].startMin, s.meetings[0].endMin)}`
                                        : 'Online (asynchronous)'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove"
                                onClick={() => {
                                    onRemove(s.crn);
                                }}
                            >
                                <Trash2 className="w-4 h-4 text-[--status-danger]" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

interface StatBlockProps {
    label: string;
    value: number | string;
    suffix?: string;
    tone?: 'default' | 'warn';
}
const StatBlock = ({ label, value, suffix, tone = 'default' }: StatBlockProps) => (
    <Card padding="md">
        <p className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-bold">
            {label}
        </p>
        <p
            className={cn(
                'mt-1 text-[24px] font-black utsa-tabular leading-tight',
                tone === 'warn' ? 'text-[--status-warn]' : 'text-[--ink-strong]'
            )}
        >
            {value}
            {suffix && (
                <span className="text-[14px] text-[--ink-muted] font-medium ml-1">{suffix}</span>
            )}
        </p>
    </Card>
);

interface SavedPaneProps {
    saved: string[];
    onUnsave: (crn: string) => void;
    onAdd: (crn: string) => void;
    onOpen: (s: Section) => void;
}
const SavedPane = ({ saved, onUnsave, onAdd, onOpen }: SavedPaneProps) => {
    if (saved.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[--brand-soft] flex items-center justify-center">
                    <Bookmark className="w-7 h-7 text-[--brand-default]" />
                </div>
                <p className="text-[13px] text-[--ink-muted]">
                    Bookmarks land here. Tap the bookmark icon on any section card.
                </p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {saved.map((crn) => {
                const s = sectionByCrn.get(crn);
                if (!s) return null;
                return (
                    <SectionCard
                        key={crn}
                        section={s}
                        course={courseById.get(s.courseId)}
                        saved
                        inConflict={false}
                        onAdd={() => {
                            onAdd(crn);
                        }}
                        onSave={() => {
                            onUnsave(crn);
                        }}
                        onOpen={onOpen}
                    />
                );
            })}
        </div>
    );
};

interface SettingsPaneProps {
    prefs: UserPrefs;
    onChange: (patch: Partial<UserPrefs>) => void;
}
const SettingsPane = ({ prefs, onChange }: SettingsPaneProps) => (
    <div className="max-w-2xl space-y-4">
        <ToggleRow
            icon={PlaneTakeoff}
            title="F1 mode"
            description="Hide online-async sections, monitor in-person credit hours, and warn if you drop below the 12-hr CPT/OPT minimum. Built specifically for international students at UTSA."
            checked={prefs.f1Mode}
            onChange={(v) => {
                onChange({ f1Mode: v });
            }}
            badge="Differentiator"
        />
        <ToggleRow
            icon={Shield}
            title="GPA-protect mode"
            description="Hide instructors with historical avg GPA below your threshold (sourced from UTSA Bluebook). Protects scholarship/Honors GPA targets. Wires to live grade data once Bluebook ingest ships in v1.1."
            checked={prefs.gpaProtect}
            onChange={(v) => {
                onChange({ gpaProtect: v });
            }}
            badge="v1.1 preview"
        />
        <Card padding="md" className="bg-[--surface-muted] border-dashed">
            <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[--accent-default] shrink-0 mt-0.5" />
                <div>
                    <p className="text-[13px] font-bold text-[--ink-strong]">Coming next</p>
                    <ul className="text-[12px] text-[--ink-muted] mt-1 space-y-0.5 list-disc list-inside">
                        <li>
                            Schedule optimizer (v1.1) — set your courses, get the best valid
                            combination ranked by RMP + grade history + compactness.
                        </li>
                        <li>
                            Waitlist watcher (v1.2) — desktop notifications when a closed section
                            opens up.
                        </li>
                        <li>
                            AI registration coach — Claude-backed advisor that reads your degree
                            audit + saved sections.
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    </div>
);

interface ToggleRowProps {
    icon: typeof PlaneTakeoff;
    title: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    badge: string;
}
const ToggleRow = ({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
    badge
}: ToggleRowProps) => (
    <Card padding="md">
        <div className="flex items-start gap-4">
            <div
                className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    checked
                        ? 'bg-[--accent-default] text-white'
                        : 'bg-[--surface-muted] text-[--ink-muted]'
                )}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-[--ink-strong] tracking-tight">
                        {title}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-[--accent-soft] text-[--accent-default] text-[9px] uppercase font-bold tracking-wider">
                        {badge}
                    </span>
                </div>
                <p className="text-[12px] text-[--ink-muted] leading-relaxed mt-1">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={`Toggle ${title}`}
                onClick={() => {
                    onChange(!checked);
                }}
                className={cn(
                    'relative w-11 h-6 rounded-full transition-colors shrink-0',
                    checked ? 'bg-[--accent-default]' : 'bg-[--surface-sunken]'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                        checked ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                />
                {checked && (
                    <CheckCircle2 className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-80" />
                )}
            </button>
        </div>
    </Card>
);

export default App;
