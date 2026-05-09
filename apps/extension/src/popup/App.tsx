import { useMemo, useState } from 'react';
import {
    Search,
    Sparkles,
    LayoutDashboard,
    Calendar,
    BookOpen,
    Bookmark,
    Sun,
    Moon,
    GraduationCap,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    FreshnessChip,
    Input,
    Tooltip,
    TooltipProvider,
    cn
} from '@utsaregplus/ui';
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
import { SectionCard } from './SectionCard.js';
import { usePersistedSchedule } from '../hooks/usePersistedSchedule.js';

type Tab = 'explore' | 'schedule' | 'saved';

const courseById = new Map(ALL_COURSES.map((c) => [c.id, c]));
const sectionByCrn = new Map(ALL_SECTIONS.map((s) => [s.crn, s]));

const sectionsFreshness = {
    source: 'snapshot' as const,
    fetchedAt: SECTIONS_FETCHED_AT
};

const useTheme = (): { theme: 'light' | 'dark'; toggle: () => void } => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof document === 'undefined') return 'light';
        return (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'light';
    });
    return {
        theme,
        toggle: () => {
            const next = theme === 'light' ? 'dark' : 'light';
            document.documentElement.dataset.theme = next;
            setTheme(next);
            void chrome.storage.sync.set({ theme: next });
        }
    };
};

export const App = () => {
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [query, setQuery] = useState('');
    const { crns, saved, addSection, removeSection, toggleSaved, hydrated } =
        usePersistedSchedule();
    const { theme, toggle: toggleTheme } = useTheme();

    const committed = useMemo<Section[]>(
        () => crns.map((c) => sectionByCrn.get(c)).filter((s): s is Section => Boolean(s)),
        [crns]
    );

    const visibleResults = useMemo<Section[]>(() => {
        const q = query.trim().toLowerCase();
        if (q.length === 0) return [];
        return ALL_SECTIONS.filter((s) => {
            const course = courseById.get(s.courseId);
            return (
                s.crn.includes(q) ||
                s.courseId.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q) ||
                s.instructorName.toLowerCase().includes(q) ||
                (course?.title.toLowerCase().includes(q) ?? false)
            );
        }).slice(0, 12);
    }, [query]);

    const conflictSet = useMemo(
        () => findConflictsAgainst(committed, visibleResults),
        [committed, visibleResults]
    );

    const totalCredits = totalCreditHours(committed);

    const handleAdd = (section: Section): void => {
        addSection(section.crn);
        setActiveTab('schedule');
    };

    const handleSave = (section: Section): void => {
        toggleSaved(section.crn);
    };

    const handleOpenDashboard = (): void => {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    };

    const handleOpenDetails = (section: Section): void => {
        chrome.tabs.create({
            url: `${chrome.runtime.getURL('dashboard.html')}#course=${section.courseId}`
        });
    };

    return (
        <TooltipProvider delayDuration={250}>
            <div className="w-[420px] h-[600px] flex flex-col bg-[--surface-canvas] text-[--ink-default] overflow-hidden">
                <header className="px-5 pt-4 pb-3 border-b border-[--border-default] bg-[--surface-default]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[--accent-default] flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[14px] font-bold text-[--ink-strong] leading-tight tracking-tight">
                                    UTSA Reg<span className="text-[--accent-default]">+</span>
                                </h1>
                                <p className="text-[9px] text-[--ink-subtle] uppercase tracking-wider font-semibold">
                                    {SECTIONS_TERM_LABEL}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Tooltip content={theme === 'light' ? 'Dark mode' : 'Light mode'}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="w-4 h-4" />
                                    ) : (
                                        <Sun className="w-4 h-4" />
                                    )}
                                </Button>
                            </Tooltip>
                            <Tooltip content="Open full dashboard">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleOpenDashboard}
                                    aria-label="Open dashboard"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <Input
                        leadingAdornment={<Search />}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                        placeholder="Search CRN, class code, or title..."
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- popup opens with intent to type; AT users can Tab away instantly
                        autoFocus
                    />
                </header>

                <nav className="flex border-b border-[--border-default] bg-[--surface-default]">
                    {(
                        [
                            { id: 'explore', icon: BookOpen, label: 'Explore' },
                            { id: 'schedule', icon: Calendar, label: 'Schedule' },
                            { id: 'saved', icon: Bookmark, label: 'Saved' }
                        ] as { id: Tab; icon: typeof BookOpen; label: string }[]
                    ).map((tab) => {
                        const isActive = activeTab === tab.id;
                        const count =
                            tab.id === 'schedule'
                                ? crns.length
                                : tab.id === 'saved'
                                  ? saved.length
                                  : null;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                }}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold tracking-wide transition-colors',
                                    'border-b-2 -mb-px relative',
                                    isActive
                                        ? 'text-[--ink-strong] border-[--accent-default]'
                                        : 'text-[--ink-muted] border-transparent hover:text-[--ink-default] hover:bg-[--surface-muted]'
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {count !== null && count > 0 && (
                                    <span
                                        className={cn(
                                            'ml-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] flex items-center justify-center utsa-tabular',
                                            isActive
                                                ? 'bg-[--accent-default] text-white'
                                                : 'bg-[--surface-sunken] text-[--ink-muted]'
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <main className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeTab === 'explore' && (
                        <ExploreTab
                            visibleResults={visibleResults}
                            conflictSet={conflictSet}
                            committedCrns={crns}
                            savedSet={new Set(saved)}
                            query={query}
                            onAdd={handleAdd}
                            onSave={handleSave}
                            onOpen={handleOpenDetails}
                            onSetQuery={setQuery}
                        />
                    )}
                    {activeTab === 'schedule' && (
                        <ScheduleTab
                            committed={committed}
                            totalCredits={totalCredits}
                            hydrated={hydrated}
                            onRemove={removeSection}
                        />
                    )}
                    {activeTab === 'saved' && (
                        <SavedTab
                            saved={saved}
                            onUnsave={toggleSaved}
                            onAddToSchedule={addSection}
                        />
                    )}
                </main>

                <footer className="px-4 py-2 border-t border-[--border-default] bg-[--surface-default] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-[--ink-subtle]">
                        <Sparkles className="w-3 h-3 text-[--accent-default]" />
                        <span className="font-semibold tracking-wide">UTSA Reg+ v0.1</span>
                    </div>
                    <FreshnessChip freshness={sectionsFreshness} />
                </footer>
            </div>
        </TooltipProvider>
    );
};

interface ExploreProps {
    visibleResults: Section[];
    conflictSet: Set<string>;
    committedCrns: string[];
    savedSet: Set<string>;
    query: string;
    onAdd: (s: Section) => void;
    onSave: (s: Section) => void;
    onOpen: (s: Section) => void;
    onSetQuery: (q: string) => void;
}

const QUICK_PROMPTS = ['CS 3343', 'CS 2123', 'MAT 1214', 'AI', 'Boppana'];

const ExploreTab = ({
    visibleResults,
    conflictSet,
    committedCrns,
    savedSet,
    query,
    onAdd,
    onSave,
    onOpen,
    onSetQuery
}: ExploreProps) => {
    if (query.trim().length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[--accent-soft] flex items-center justify-center">
                    <Search className="w-6 h-6 text-[--accent-default]" />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-[--ink-strong]">
                        Search any UTSA section
                    </p>
                    <p className="text-[11px] text-[--ink-muted] mt-1 leading-relaxed">
                        CRN, class code, title, or instructor.
                        <br />
                        Live RateMyProfessor data on every result.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[280px]">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            onClick={() => {
                                onSetQuery(prompt);
                            }}
                            className="px-2.5 py-1 rounded-full bg-[--surface-default] border border-[--border-default] text-[10px] font-semibold text-[--ink-default] hover:bg-[--surface-muted] hover:border-[--border-strong] transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (visibleResults.length === 0) {
        return (
            <div className="text-center py-12 text-[12px] text-[--ink-muted]">
                <p>
                    No matches for{' '}
                    <span className="font-semibold text-[--ink-default]">"{query}"</span>
                </p>
                <p className="text-[10px] mt-2">
                    Demo data is CS-major sample. Live ASAP harvest will widen this.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {visibleResults.map((section) => (
                <SectionCard
                    key={section.crn}
                    section={section}
                    course={courseById.get(section.courseId)}
                    saved={savedSet.has(section.crn)}
                    inConflict={
                        conflictSet.has(section.crn) && !committedCrns.includes(section.crn)
                    }
                    onAdd={onAdd}
                    onSave={onSave}
                    onOpen={onOpen}
                />
            ))}
        </div>
    );
};

interface ScheduleTabProps {
    committed: Section[];
    totalCredits: number;
    hydrated: boolean;
    onRemove: (crn: string) => void;
}

const ScheduleTab = ({ committed, totalCredits, hydrated, onRemove }: ScheduleTabProps) => {
    if (!hydrated) {
        return <div className="text-center py-6 text-[--ink-subtle] text-[12px]">Loading...</div>;
    }
    if (committed.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[--brand-soft] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[--brand-default]" />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-[--ink-strong]">
                        No classes added yet
                    </p>
                    <p className="text-[11px] text-[--ink-muted] mt-1">
                        Search and tap{' '}
                        <span className="font-semibold text-[--accent-default]">Add</span> on any
                        section.
                    </p>
                </div>
            </div>
        );
    }

    const f1WarningTriggered = totalCredits < 12;

    return (
        <div className="space-y-3">
            <Card padding="sm">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-semibold">
                            Credits
                        </p>
                        <p className="text-[18px] font-black text-[--ink-strong] utsa-tabular leading-tight">
                            {totalCredits}
                            <span className="text-[--ink-muted] text-[12px] font-medium">
                                {' '}
                                / 18
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[--ink-subtle] font-semibold">
                            Sections
                        </p>
                        <p className="text-[18px] font-black text-[--ink-strong] utsa-tabular leading-tight">
                            {committed.length}
                        </p>
                    </div>
                </div>
                {f1WarningTriggered && (
                    <div className="mt-2 pt-2 border-t border-[--border-default] flex items-start gap-1.5 text-[10px] text-[--status-warn]">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>
                            <strong>F1 alert:</strong> Below 12 credits. International students need
                            ≥12 in-person hours to maintain CPT/OPT eligibility.
                        </span>
                    </div>
                )}
            </Card>

            {committed.map((section) => (
                <Card key={section.crn} padding="sm" className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-[--ink-strong] utsa-tabular">
                                {section.courseId}
                            </span>
                            <Badge tone="brand" size="sm">
                                §{section.sectionCode}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-[--ink-muted] truncate">{section.title}</p>
                        <p className="text-[10px] text-[--ink-muted] mt-0.5 utsa-tabular">
                            {section.meetings[0]
                                ? `${formatDays(section.meetings[0].days)} · ${formatTimeRange(section.meetings[0].startMin, section.meetings[0].endMin)}`
                                : 'Online'}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove from schedule"
                        onClick={() => {
                            onRemove(section.crn);
                        }}
                    >
                        <Trash2 className="w-4 h-4 text-[--status-danger]" />
                    </Button>
                </Card>
            ))}
        </div>
    );
};

interface SavedTabProps {
    saved: string[];
    onUnsave: (crn: string) => void;
    onAddToSchedule: (crn: string) => void;
}

const SavedTab = ({ saved, onUnsave, onAddToSchedule }: SavedTabProps) => {
    if (saved.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[--brand-soft] flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-[--brand-default]" />
                </div>
                <p className="text-[12px] text-[--ink-muted]">
                    Tap the bookmark on any section to save it for later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {saved.map((crn) => {
                const section = sectionByCrn.get(crn);
                if (!section) return null;
                return (
                    <Card key={crn} padding="sm" className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[--ink-strong] utsa-tabular">
                                {section.courseId} §{section.sectionCode}
                            </p>
                            <p className="text-[10px] text-[--ink-muted] truncate">
                                {section.title} · {section.instructorName}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onAddToSchedule(crn);
                            }}
                        >
                            Add
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Unsave"
                            onClick={() => {
                                onUnsave(crn);
                            }}
                        >
                            <Trash2 className="w-4 h-4 text-[--status-danger]" />
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
};

export default App;
