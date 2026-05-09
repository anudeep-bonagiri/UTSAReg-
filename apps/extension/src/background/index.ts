/**
 * UTSA Reg+ background service worker.
 *
 * Responsibilities:
 *   1. Resolve UTSA's RMP school ID once and cache it forever.
 *   2. Serve getRmpRating requests from popup/dashboard/content surfaces.
 *      - Cache hit (fresh)  -> return immediately, source: cache-fresh
 *      - Cache hit (stale)  -> return immediately, source: cache-stale,
 *                              kick off a revalidate in the background
 *      - Cache miss         -> fetch live, cache, return source: live
 *   3. (Future) Periodic waitlist polling via chrome.alarms.
 */

import {
    RmpClient,
    fetchRatingForInstructor,
    resolveUtsaSchoolId
} from '@utsaregplus/adapter-utsa/rmp';
import {
    getCachedRating,
    getCachedSchoolId,
    setCachedRating,
    setCachedSchoolId
} from '../storage/rmpCache.js';
import type {
    GetRmpRatingRequest,
    GetRmpRatingResponse,
    WorkerRequest
} from '../messaging/protocol.js';

const log = (...args: unknown[]): void => {
    console.info('[utsa-reg+ bg]', ...args);
};

const client = new RmpClient();

const ensureSchoolId = async (): Promise<string> => {
    const cached = await getCachedSchoolId();
    if (cached) return cached;
    log('resolving UTSA school ID via SchoolSearch...');
    const id = await resolveUtsaSchoolId(client);
    await setCachedSchoolId(id);
    log('school ID resolved and cached:', id);
    return id;
};

/**
 * SWR rating lookup. Returns immediately from cache when possible; on stale
 * hit, fires off a background refresh that updates the cache so the next
 * request gets fresh data.
 */
const lookupRating = async (
    instructorName: string
): Promise<GetRmpRatingResponse> => {
    if (!instructorName || instructorName.toUpperCase() === 'TBA') {
        return { ok: true, result: null };
    }
    try {
        const cached = await getCachedRating(instructorName);
        if (cached?.freshness.source === 'cache-fresh') {
            return { ok: true, result: cached };
        }

        if (cached?.freshness.source === 'cache-stale') {
            // Return stale immediately, revalidate behind the scenes.
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

const isRatingRequest = (msg: unknown): msg is GetRmpRatingRequest =>
    typeof msg === 'object' &&
    msg !== null &&
    (msg as { type?: string }).type === 'getRmpRating';

chrome.runtime.onMessage.addListener(
    (message: WorkerRequest, _sender, sendResponse) => {
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
            return true; // keep the channel open for async sendResponse
        }
        return false;
    }
);

log('service worker started');
