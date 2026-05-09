import type { Fresh, RmpRating } from '@utsaregplus/core';

/**
 * SWR cache for RMP ratings, backed by chrome.storage.local.
 *
 *   get(key)       Hit fresh -> {data, freshness: 'cache-fresh'}
 *                  Hit stale -> {data, freshness: 'cache-stale'}
 *                  Miss      -> null
 *   set(key, val)  Always overwrites with current timestamp.
 *
 * "Stale" is computed by comparing fetchedAt to maxAgeMs from the freshness
 * envelope at write time. The cache layer never invents TTL — adapters do.
 */

const STORAGE_PREFIX = 'rmp:v1:';
const SCHOOL_ID_KEY = 'rmp:v1:schoolId';

export const ratingKey = (instructorName: string): string =>
    `${STORAGE_PREFIX}${instructorName.toLowerCase().trim()}`;

/**
 * Looks up a cached RmpRating. Returns null on miss. On hit, the freshness
 * source is rewritten to cache-fresh or cache-stale based on age.
 */
export const getCachedRating = async (
    instructorName: string,
    nowMs: number = Date.now()
): Promise<Fresh<RmpRating> | null> => {
    const key = ratingKey(instructorName);
    const result = await chrome.storage.local.get(key);
    const stored = result[key] as Fresh<RmpRating> | undefined;
    if (!stored) return null;

    const fetchedAtMs = new Date(stored.freshness.fetchedAt).getTime();
    const ageMs = nowMs - fetchedAtMs;
    const stale =
        stored.freshness.maxAgeMs !== undefined && ageMs > stored.freshness.maxAgeMs;

    return {
        data: stored.data,
        freshness: {
            ...stored.freshness,
            source: stale ? 'cache-stale' : 'cache-fresh'
        }
    };
};

export const setCachedRating = async (
    instructorName: string,
    fresh: Fresh<RmpRating>
): Promise<void> => {
    await chrome.storage.local.set({ [ratingKey(instructorName)]: fresh });
};

/**
 * UTSA's RMP school ID is resolved once and cached effectively forever
 * (until the user uninstalls). We persist it separately so we don't hit
 * SchoolSearch on every popup open.
 */
export const getCachedSchoolId = async (): Promise<string | null> => {
    const result = await chrome.storage.local.get(SCHOOL_ID_KEY);
    const id = result[SCHOOL_ID_KEY];
    return typeof id === 'string' ? id : null;
};

export const setCachedSchoolId = async (id: string): Promise<void> => {
    await chrome.storage.local.set({ [SCHOOL_ID_KEY]: id });
};

/** Drop every rmp:* key. Useful in dev / settings "clear cache". */
export const clearRmpCache = async (): Promise<void> => {
    const all = await chrome.storage.local.get(null);
    const rmpKeys = Object.keys(all).filter((k) => k.startsWith(STORAGE_PREFIX));
    if (rmpKeys.length > 0) {
        await chrome.storage.local.remove(rmpKeys);
    }
};
