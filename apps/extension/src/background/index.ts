/**
 * UTSA Reg+ background service worker.
 *
 * Responsibilities:
 *   1. Resolve UTSA's RMP school ID once and cache it forever.
 *   2. Serve getRmpRating requests from popup/dashboard/content surfaces.
 *      SWR semantics: fresh hit = immediate, stale = immediate + revalidate,
 *      miss = live fetch.
 *   3. Serve getSyllabusContext requests by joining the live Simple Syllabus
 *      org tree with the requested course's subject prefix. Returns the
 *      department's real course/section counts plus a deep-link to the
 *      public Simple Syllabus library URL.
 */

import {
    RmpClient,
    fetchRatingForInstructor,
    resolveUtsaSchoolId
} from '@utsaregplus/adapter-utsa/rmp';
import { fetchAsapSections } from '@utsaregplus/adapter-utsa/asap';
import {
    buildLibrarySearchUrl,
    fetchUtsaOrganizations,
    findDepartmentForSubject,
    subjectFromCourseId
} from '@utsaregplus/adapter-utsa/syllabus';
import type { SyllabusOrganization } from '@utsaregplus/adapter-utsa/syllabus';
import type { Section } from '@utsaregplus/core';
import {
    getCachedRating,
    getCachedSchoolId,
    setCachedRating,
    setCachedSchoolId
} from '../storage/rmpCache.js';
import type {
    GetRmpRatingRequest,
    GetRmpRatingResponse,
    GetSyllabusContextRequest,
    GetSyllabusContextResponse,
    RefreshAsapSubjectsRequest,
    RefreshAsapSubjectsResponse,
    SyllabusContext,
    WorkerRequest
} from '../messaging/protocol.js';

const log = (...args: unknown[]): void => {
    console.info('[utsa-reg+ bg]', ...args);
};

const client = new RmpClient();

/**
 * In-memory cache of the Simple Syllabus org tree. Service workers can be
 * terminated by Chrome at any moment, so the cache is also persisted to
 * chrome.storage.local for warm-start hydration. The wrapper checks memory
 * first, falls back to storage, then finally fetches.
 */
const ORG_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const ORG_CACHE_STORAGE_KEY = 'syllabus:orgs:v1';
let orgsCache: { value: SyllabusOrganization[]; fetchedAt: number } | null = null;

interface OrgsStoragePayload {
    value: SyllabusOrganization[];
    fetchedAt: number;
}

const hydrateOrgsCache = async (): Promise<void> => {
    if (orgsCache) return;
    try {
        const stored = await chrome.storage.local.get(ORG_CACHE_STORAGE_KEY);
        const raw = stored[ORG_CACHE_STORAGE_KEY] as OrgsStoragePayload | undefined;
        if (
            raw &&
            Array.isArray(raw.value) &&
            typeof raw.fetchedAt === 'number' &&
            Date.now() - raw.fetchedAt < ORG_CACHE_TTL_MS
        ) {
            orgsCache = raw;
            log('hydrated org cache from chrome.storage', raw.value.length, 'orgs');
        }
    } catch (err) {
        log('failed to hydrate org cache:', err);
    }
};

const persistOrgsCache = async (
    payload: OrgsStoragePayload
): Promise<void> => {
    try {
        await chrome.storage.local.set({ [ORG_CACHE_STORAGE_KEY]: payload });
    } catch (err) {
        log('failed to persist org cache:', err);
    }
};

const ensureSchoolId = async (): Promise<string> => {
    const cached = await getCachedSchoolId();
    if (cached) return cached;
    log('resolving UTSA school ID via SchoolSearch...');
    const id = await resolveUtsaSchoolId(client);
    await setCachedSchoolId(id);
    log('school ID resolved and cached:', id);
    return id;
};

const ensureOrgs = async (): Promise<SyllabusOrganization[]> => {
    const now = Date.now();
    await hydrateOrgsCache();
    if (orgsCache && now - orgsCache.fetchedAt < ORG_CACHE_TTL_MS) {
        return orgsCache.value;
    }
    log('fetching Simple Syllabus org tree...');
    const orgs = await fetchUtsaOrganizations();
    const payload = { value: orgs, fetchedAt: now };
    orgsCache = payload;
    await persistOrgsCache(payload);
    log('cached', orgs.length, 'organizations');
    return orgs;
};

const lookupRating = async (instructorName: string): Promise<GetRmpRatingResponse> => {
    if (!instructorName || instructorName.toUpperCase() === 'TBA') {
        return { ok: true, result: null };
    }
    try {
        const cached = await getCachedRating(instructorName);
        if (cached?.freshness.source === 'cache-fresh') {
            return { ok: true, result: cached };
        }
        if (cached?.freshness.source === 'cache-stale') {
            void revalidateInBackground(instructorName);
            return { ok: true, result: cached };
        }
        const schoolId = await ensureSchoolId();
        const fresh = await fetchRatingForInstructor(client, {
            instructorName,
            schoolId
        });
        if (fresh) {
            await setCachedRating(instructorName, fresh);
        }
        return { ok: true, result: fresh };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log('rating lookup failed:', instructorName, message);
        return { ok: false, error: message };
    }
};

const revalidateInBackground = async (instructorName: string): Promise<void> => {
    try {
        const schoolId = await ensureSchoolId();
        const fresh = await fetchRatingForInstructor(client, {
            instructorName,
            schoolId
        });
        if (fresh) {
            await setCachedRating(instructorName, fresh);
            log('revalidated', instructorName);
        }
    } catch (err) {
        log('revalidate failed for', instructorName, err);
    }
};

const lookupSyllabusContext = async (courseId: string): Promise<GetSyllabusContextResponse> => {
    try {
        const orgs = await ensureOrgs();
        const subject = subjectFromCourseId(courseId);
        const dept = findDepartmentForSubject(subject, orgs);
        if (!dept) return { ok: true, result: null };
        const result: SyllabusContext = {
            departmentName: dept.name,
            courseCount: dept.course_count ?? 0,
            sectionCount: dept.section_count ?? 0,
            libraryUrl: buildLibrarySearchUrl(courseId),
            fetchedAt: new Date(orgsCache?.fetchedAt ?? Date.now()).toISOString()
        };
        return { ok: true, result };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log('syllabus lookup failed:', courseId, message);
        return { ok: false, error: message };
    }
};

const isRatingRequest = (msg: unknown): msg is GetRmpRatingRequest =>
    typeof msg === 'object' && msg !== null && (msg as { type?: string }).type === 'getRmpRating';

const isSyllabusRequest = (msg: unknown): msg is GetSyllabusContextRequest =>
    typeof msg === 'object' &&
    msg !== null &&
    (msg as { type?: string }).type === 'getSyllabusContext';

const isRefreshAsapRequest = (msg: unknown): msg is RefreshAsapSubjectsRequest =>
    typeof msg === 'object' &&
    msg !== null &&
    (msg as { type?: string }).type === 'refreshAsapSubjects';

/**
 * Just-in-time live ASAP refresh.
 *
 * Per-subject 60s rate limit + in-flight dedupe. Rate-limit prevents
 * pounding ASAP if the popup re-mounts repeatedly; dedupe collapses
 * concurrent requests for the same subject into one fetch.
 *
 * Triggered from the UI when the user is about to act on a section
 * (Save / Add / open detail), and on popup/dashboard mount for any
 * subjects already in the saved or scheduled lists.
 */
const ASAP_HARVEST_KEY = 'asap:sections:v1';
const ASAP_REFRESH_COOLDOWN_MS = 60_000;
const ASAP_PARALLEL_LIMIT = 4;

const lastRefreshBySubject = new Map<string, number>();
const inflightBySubject = new Map<string, Promise<Section[]>>();

interface AsapHarvestPayload {
    schemaVersion: 1;
    fetchedAt: string;
    termId: string | null;
    sourceUrl: string;
    sections: Section[];
    subjectFetchedAt?: Record<string, string>;
}

const fetchSubjectOnce = (termId: string, subject: string): Promise<Section[]> => {
    const key = `${termId}:${subject}`;
    const existing = inflightBySubject.get(key);
    if (existing) return existing;
    const p = fetchAsapSections({
        termId,
        subjects: [subject],
        timeoutMs: 15_000,
        warn: (m) => {
            log(`[asap-refresh ${subject}] ${m}`);
        }
    }).finally(() => {
        inflightBySubject.delete(key);
    });
    inflightBySubject.set(key, p);
    return p;
};

const mergeRefreshIntoHarvest = async (
    termId: string,
    subjectResults: { subject: string; sections: Section[]; fetchedAt: string }[]
): Promise<void> => {
    if (subjectResults.length === 0) return;
    const got = await chrome.storage.local.get(ASAP_HARVEST_KEY);
    const existing = (got[ASAP_HARVEST_KEY] as AsapHarvestPayload | undefined) ?? null;

    const byCrn = new Map<string, Section>();
    if (existing?.termId === termId) {
        for (const s of existing.sections) byCrn.set(s.crn, s);
    }
    for (const { sections } of subjectResults) {
        for (const s of sections) byCrn.set(s.crn, s);
    }

    const subjectFetchedAt: Record<string, string> = {
        ...(existing?.subjectFetchedAt ?? {})
    };
    for (const { subject, fetchedAt } of subjectResults) {
        subjectFetchedAt[subject] = fetchedAt;
    }

    const payload: AsapHarvestPayload = {
        schemaVersion: 1,
        fetchedAt: new Date().toISOString(),
        termId,
        sourceUrl: existing?.sourceUrl ?? 'background:refresh',
        sections: Array.from(byCrn.values()),
        subjectFetchedAt
    };
    await chrome.storage.local.set({ [ASAP_HARVEST_KEY]: payload });
};

const refreshAsapSubjects = async (
    req: RefreshAsapSubjectsRequest
): Promise<RefreshAsapSubjectsResponse> => {
    const termId = req.termId;
    const force = req.force === true;
    const now = Date.now();

    const uniq = Array.from(new Set(req.subjects.map((s) => s.toUpperCase()))).filter(
        (s) => /^[A-Z]{2,4}$/.test(s)
    );
    if (uniq.length === 0) {
        return { ok: true, refreshed: [], skipped: [], errors: [] };
    }

    const targets: string[] = [];
    const skipped: string[] = [];
    for (const s of uniq) {
        const last = lastRefreshBySubject.get(`${termId}:${s}`) ?? 0;
        if (!force && now - last < ASAP_REFRESH_COOLDOWN_MS) {
            skipped.push(s);
        } else {
            targets.push(s);
        }
    }

    if (targets.length === 0) {
        return { ok: true, refreshed: [], skipped, errors: [] };
    }

    const errors: { subject: string; message: string }[] = [];
    const ok: { subject: string; sections: Section[]; fetchedAt: string }[] = [];

    // Run with a small concurrency cap so we don't hammer ASAP.
    let cursor = 0;
    const worker = async (): Promise<void> => {
        while (cursor < targets.length) {
            const idx = cursor++;
            const subject = targets[idx];
            if (!subject) break;
            try {
                const sections = await fetchSubjectOnce(termId, subject);
                const fetchedAt = new Date().toISOString();
                ok.push({ subject, sections, fetchedAt });
                lastRefreshBySubject.set(`${termId}:${subject}`, Date.now());
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                errors.push({ subject, message });
                log(`refresh failed for ${subject}:`, message);
            }
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(ASAP_PARALLEL_LIMIT, targets.length) }, () => worker())
    );

    if (ok.length > 0) {
        try {
            await mergeRefreshIntoHarvest(termId, ok);
            log(`refreshed ${ok.length} subjects: ${ok.map((o) => o.subject).join(', ')}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log('merge failed:', message);
            return { ok: false, error: `merge failed: ${message}` };
        }
    }

    return {
        ok: true,
        refreshed: ok.map((o) => o.subject),
        skipped,
        errors
    };
};

chrome.runtime.onMessage.addListener((message: WorkerRequest, _sender, sendResponse) => {
    if (isRatingRequest(message)) {
        lookupRating(message.instructorName)
            .then((response) => {
                sendResponse(response);
            })
            .catch((err: unknown) => {
                sendResponse({
                    ok: false,
                    error: err instanceof Error ? err.message : String(err)
                } satisfies GetRmpRatingResponse);
            });
        return true;
    }
    if (isSyllabusRequest(message)) {
        lookupSyllabusContext(message.courseId)
            .then((response) => {
                sendResponse(response);
            })
            .catch((err: unknown) => {
                sendResponse({
                    ok: false,
                    error: err instanceof Error ? err.message : String(err)
                } satisfies GetSyllabusContextResponse);
            });
        return true;
    }
    if (isRefreshAsapRequest(message)) {
        refreshAsapSubjects(message)
            .then((response) => {
                sendResponse(response);
            })
            .catch((err: unknown) => {
                sendResponse({
                    ok: false,
                    error: err instanceof Error ? err.message : String(err)
                } satisfies RefreshAsapSubjectsResponse);
            });
        return true;
    }
    return false;
});

/**
 * Daily refresh — wakes once every 12 hours, evicts stale RMP entries past
 * their TTL and re-warms the org tree. Keeps the extension's data fresh
 * without forcing the user to re-open the popup. Uses chrome.alarms which
 * survives service-worker termination.
 */
const REFRESH_ALARM = 'utsa:refresh-caches';

const evictStaleRatings = async (): Promise<number> => {
    const all = await chrome.storage.local.get(null);
    const now = Date.now();
    const toRemove: string[] = [];
    for (const [key, value] of Object.entries(all)) {
        if (!key.startsWith('rmp:v1:')) continue;
        if (key === 'rmp:v1:schoolId') continue;
        const v = value as { freshness?: { fetchedAt?: string; maxAgeMs?: number } } | null;
        if (!v?.freshness?.fetchedAt) {
            toRemove.push(key);
            continue;
        }
        const age = now - new Date(v.freshness.fetchedAt).getTime();
        // Evict anything past 7 days regardless of TTL.
        if (age > 7 * 24 * 60 * 60 * 1000) {
            toRemove.push(key);
        }
    }
    if (toRemove.length > 0) {
        await chrome.storage.local.remove(toRemove);
    }
    return toRemove.length;
};

const refreshCaches = async (): Promise<void> => {
    log('daily refresh: evicting stale RMP entries...');
    try {
        const evicted = await evictStaleRatings();
        log(`evicted ${evicted} stale rating entries.`);
    } catch (err) {
        log('eviction failed:', err);
    }
    // Force-refresh the org tree on the next ensureOrgs call.
    orgsCache = null;
    try {
        await chrome.storage.local.remove('syllabus:orgs:v1');
    } catch (err) {
        log('failed to clear org cache:', err);
    }
    log('daily refresh complete.');
};

chrome.runtime.onInstalled.addListener(() => {
    log('extension installed/updated; scheduling daily refresh.');
    void chrome.alarms.create(REFRESH_ALARM, {
        periodInMinutes: 12 * 60
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === REFRESH_ALARM) {
        void refreshCaches();
    }
});

log('service worker started');
