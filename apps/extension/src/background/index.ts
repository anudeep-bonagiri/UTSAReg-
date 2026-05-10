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
import {
    buildLibrarySearchUrl,
    fetchUtsaOrganizations,
    findDepartmentForSubject,
    subjectFromCourseId
} from '@utsaregplus/adapter-utsa/syllabus';
import type { SyllabusOrganization } from '@utsaregplus/adapter-utsa/syllabus';
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
    SyllabusContext,
    WorkerRequest
} from '../messaging/protocol.js';

const log = (...args: unknown[]): void => {
    console.info('[utsa-reg+ bg]', ...args);
};

const client = new RmpClient();

// In-memory caches local to the SW lifetime. Service workers can be killed
// at any time, so we re-fetch on cold start; that's fast enough for both.
let orgsCache: { value: SyllabusOrganization[]; fetchedAt: number } | null = null;
const ORG_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

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
    if (orgsCache && now - orgsCache.fetchedAt < ORG_CACHE_TTL_MS) {
        return orgsCache.value;
    }
    log('fetching Simple Syllabus org tree...');
    const orgs = await fetchUtsaOrganizations();
    orgsCache = { value: orgs, fetchedAt: now };
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
    return false;
});

log('service worker started');
