import { useMemo, useState } from 'react';
import {
    Search,
    LayoutDashboard,
    Calendar,
    BookOpen,
    Bookmark,
    Sun,
    Moon,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { Badge, Button, Card, FreshnessChip, Tooltip, TooltipProvider, cn } from '@utsaregplus/ui';
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
        // Normalize: lowercase, strip all whitespace. So "CS 3343" matches "CS3343".
        const q = query.trim().toLowerCase();
        const qStripped = q.replace(/\s+/g, '');
        if (qStripped.length === 0) return [];
        return ALL_SECTIONS.filter((s) => {
            const course = courseById.get(s.courseId);
            return (
                s.crn.includes(qStripped) ||
                s.courseId.toLowerCase().includes(qStripped) ||
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
        void chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    };
    const handleOpenDetails = (section: Section): void => {
        void chrome.tabs.create({
            url: `${chrome.runtime.getURL('dashboard.html')}#course=${section.courseId}`
        });
    };

    return (
        <TooltipProvider delayDuration={250}>
            <div className="w-[420px] h-[600px] flex flex-col bg-[var(--surface-canvas)] text-[var(--ink-default)] overflow-hidden">
                {/* Editorial Midnight masthead */}
                <header className="utsa-midnight px-5 pt-5 pb-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="utsa-eyebrow text-[var(--accent-default)] mb-1">
                                {SECTIONS_TERM_LABEL} · Issue 01
                            </span>
                            <h1 className="utsa-display-black text-white text-[28px] leading-none">
                                UTSA Reg
                                <span className="utsa-italic font-medium text-[var(--accent-default)]">
                                    +
                                </span>
                            </h1>
                            <span className="text-[10px] text-white/60 mt-1.5 leading-tight">
                                Registration intelligence,{' '}
                                <span className="utsa-italic">written for students.</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Tooltip content={theme === 'light' ? 'Dark mode' : 'Light mode'}>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    className="h-8 w-8 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="w-4 h-4" />
                                    ) : (
                                        <Sun className="w-4 h-4" />
                                    )}
                                </button>
                            </Tooltip>
                            <Tooltip content="Open full dashboard">
                                <button
                                    type="button"
                                    onClick={handleOpenDashboard}
                                    aria-label="Open dashboard"
                                    className="h-8 w-8 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Inline search — dark on light, no inheritance from the white parent */}
                    <label className="relative flex items-center group">
                        <Search
                            aria-hidden
                            className="pointer-events-none absolute left-3 w-4 h-4 text-[#8C8475]"
                        />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            placeholder="Search CRN, class, or instructor"
                            // eslint-disable-next-line jsx-a11y/no-autofocus -- popup opens with intent to type
                            autoFocus
                            spellCheck={false}
                            style={{ color: '#1F1B14' }}
                            className={cn(
                                'w-full h-10 pl-9 pr-3 rounded-md font-sans text-[13px]',
                                'bg-white border border-white/0',
                                'placeholder:text-[#8C8475] placeholder:utsa-italic',
                                'focus:outline-none focus:border-[var(--accent-default)]',
                                'focus:ring-2 focus:ring-(--accent-default)/35'
                            )}
                        />
                    </label>
                </header>

                {/* Editorial tabs as small-caps with bottom rule */}
                <nav className="flex border-b border-[var(--border-default)] bg-[var(--surface-default)]">
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
                                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold tracking-[0.18em] transition-colors uppercase',
                                    'border-b-[3px] -mb-px relative',
                                    isActive
                                        ? 'text-[var(--ink-strong)] border-[var(--accent-default)] bg-[var(--surface-muted)]'
                                        : 'text-[var(--ink-muted)] border-transparent hover:text-[var(--ink-strong)] hover:bg-[var(--surface-muted)]'
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {count !== null && count > 0 && (
                                    <span
                                        className={cn(
                                            'ml-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] flex items-center justify-center utsa-tabular font-bold',
                                            isActive
                                                ? 'bg-[var(--accent-default)] text-white'
                                                : 'bg-[var(--surface-sunken)] text-[var(--ink-muted)]'
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <main className="flex-1 overflow-y-auto p-4">
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

                <footer className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-default)] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                        <span className="utsa-display-black text-[var(--ink-strong)] text-[12px]">
                            UTSA Reg
                            <span className="text-[var(--accent-default)]">+</span>
                        </span>
                        <span className="text-[var(--ink-subtle)]">v0.1</span>
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
            <div className="utsa-anim-fade-up flex flex-col items-center text-center pt-6 pb-2 px-2 space-y-5">
                <div className="utsa-eyebrow text-[var(--accent-default)]">
                    The whole catalog. One search.
                </div>
                <h2 className="utsa-display text-[var(--ink-strong)] text-[34px] leading-[1.05] -tracking-[0.025em] max-w-[300px]">
                    Find any{' '}
                    <span className="utsa-italic font-medium text-[var(--accent-default)]">
                        section
                    </span>{' '}
                    in seconds.
                </h2>
                <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed max-w-[280px]">
                    Search by CRN, class code, title, or instructor. Live RateMyProfessor ratings on
                    every result.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[280px] pt-1">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            onClick={() => {
                                onSetQuery(prompt);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[var(--surface-default)] border border-[var(--border-strong)] text-[10px] font-bold text-[var(--ink-strong)] utsa-tabular hover:bg-[var(--brand-default)] hover:text-white hover:border-[var(--brand-default)] transition-colors"
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
            <div className="utsa-anim-fade-in text-center py-12">
                <div className="utsa-eyebrow text-[var(--ink-muted)] mb-3">No matches</div>
                <p className="utsa-display text-[var(--ink-strong)] text-[20px]">
                    Nothing for <span className="utsa-italic font-medium">"{query}"</span>
                </p>
                <p className="text-[11px] text-[var(--ink-subtle)] mt-3 max-w-[260px] mx-auto leading-relaxed">
                    Demo data is a CS-major sample. Live ASAP harvest will widen this.
                </p>
            </div>
        );
    }

    return (
        <div className="utsa-stagger space-y-2.5">
            {visibleResults.map((section) => (
                <div key={section.crn} className="utsa-anim-fade-up">
                    <SectionCard
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
                </div>
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
        return (
            <div className="text-center py-6 text-[var(--ink-subtle)] text-[12px]">Loading…</div>
        );
    }
    if (committed.length === 0) {
        return (
            <div className="utsa-anim-fade-up text-center py-12 px-4">
                <div className="utsa-eyebrow text-[var(--ink-muted)] mb-3">Nothing yet</div>
                <p className="utsa-display text-[var(--ink-strong)] text-[22px] leading-tight max-w-[260px] mx-auto">
                    Build your{' '}
                    <span className="utsa-italic font-medium text-[var(--accent-default)]">
                        weekly
                    </span>{' '}
                    plan.
                </p>
                <p className="text-[11px] text-[var(--ink-subtle)] mt-3 leading-relaxed max-w-[260px] mx-auto">
                    Search for a class and tap{' '}
                    <span className="font-bold text-[var(--accent-default)]">Add</span>. It’ll land
                    here.
                </p>
            </div>
        );
    }

    const f1Triggered = totalCredits < 12;

    return (
        <div className="utsa-stagger space-y-3">
            <Card padding="md" className="utsa-anim-fade-up">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="utsa-eyebrow text-[var(--ink-muted)] mb-0.5">
                            Total credits
                        </div>
                        <p className="utsa-display-black utsa-tabular text-[var(--ink-strong)] text-[40px] leading-none">
                            {totalCredits}
                            <span className="utsa-italic text-[var(--ink-subtle)] text-[18px] font-medium ml-1">
                                /18
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="utsa-eyebrow text-[var(--ink-muted)] mb-0.5">Sections</div>
                        <p className="utsa-display-black utsa-tabular text-[var(--ink-strong)] text-[40px] leading-none">
                            {committed.length}
                        </p>
                    </div>
                </div>
                {f1Triggered && (
                    <div className="mt-3 pt-3 border-t border-[var(--hairline)] flex items-start gap-2 text-[10px] text-[var(--status-warn)]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                            <strong>F1 alert.</strong> Below 12 in-person credits jeopardizes
                            CPT/OPT eligibility for international students.
                        </span>
                    </div>
                )}
            </Card>

            {committed.map((section) => (
                <Card
                    key={section.crn}
                    padding="sm"
                    className="utsa-anim-fade-up flex items-center gap-2"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="utsa-mono text-[12px] font-bold text-[var(--ink-strong)]">
                                {section.courseId}
                            </span>
                            <Badge tone="brand" size="sm">
                                §{section.sectionCode}
                            </Badge>
                        </div>
                        <p className="utsa-display text-[12px] text-[var(--ink-default)] truncate">
                            {section.title}
                        </p>
                        <p className="utsa-mono text-[10px] text-[var(--ink-muted)] mt-0.5">
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
                        <Trash2 className="w-4 h-4 text-[var(--status-danger)]" />
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
            <div className="utsa-anim-fade-up text-center py-12 px-4">
                <div className="utsa-eyebrow text-[var(--ink-muted)] mb-3">No bookmarks</div>
                <p className="utsa-display text-[var(--ink-strong)] text-[22px] leading-tight max-w-[260px] mx-auto">
                    Bookmark a section <span className="utsa-italic font-medium">for later.</span>
                </p>
                <p className="text-[11px] text-[var(--ink-subtle)] mt-3 leading-relaxed max-w-[260px] mx-auto">
                    Tap the bookmark icon on any section card and it’ll show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="utsa-stagger space-y-2">
            {saved.map((crn) => {
                const section = sectionByCrn.get(crn);
                if (!section) return null;
                return (
                    <Card
                        key={crn}
                        padding="sm"
                        className="utsa-anim-fade-up flex items-center gap-2"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="utsa-mono text-[12px] font-bold text-[var(--ink-strong)]">
                                {section.courseId} §{section.sectionCode}
                            </p>
                            <p className="utsa-display text-[11px] text-[var(--ink-default)] truncate">
                                {section.title}
                            </p>
                            <p className="text-[10px] text-[var(--ink-muted)]">
                                {section.instructorName}
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
                            <Trash2 className="w-4 h-4 text-[var(--status-danger)]" />
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
};

export default App;
