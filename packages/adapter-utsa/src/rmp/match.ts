/**
 * Pick the best-matching teacher node from a list of search candidates.
 *
 * RMP's full-text search ranks reasonably well, but it's case-insensitive
 * and ignores middle initials, so "Smith J A" and "Smith John Albert" can
 * both match "John A. Smith". We post-filter on Levenshtein distance to
 * the canonicalized query name, breaking ties by review count (more reviews
 * = more confident the prof actually exists).
 *
 * Pure logic — no network, no DOM, easily unit-tested.
 */

interface CandidateLike {
    firstName: string;
    lastName: string;
    numRatings: number;
}

const normalize = (s: string): string =>
    s.toLowerCase().replace(/[.,]/g, ' ').replace(/\(p\)/gi, ' ').replace(/\s+/g, ' ').trim();

/**
 * Classic Levenshtein distance. O(n*m) time, O(min(n,m)) space.
 * Adequate for inputs of <100 chars (instructor names).
 */
export const levenshtein = (a: string, b: string): number => {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    if (a.length < b.length) [a, b] = [b, a];
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const curr = new Array<number>(b.length + 1);
        curr[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            const prevAt = prev[j] ?? 0;
            const currLeft = curr[j - 1] ?? 0;
            const prevDiag = prev[j - 1] ?? 0;
            curr[j] = Math.min(prevAt + 1, currLeft + 1, prevDiag + cost);
        }
        prev = curr;
    }
    return prev[b.length] ?? 0;
};

/**
 * Score a candidate against a query. Lower = better match.
 * Distance is normalized by query length so a 1-char typo on a long name
 * doesn't outweigh a 1-char typo on a short name.
 */
export const scoreCandidate = (query: string, candidate: CandidateLike): number => {
    const q = normalize(query);
    const fullName = normalize(`${candidate.firstName} ${candidate.lastName}`);
    const reverseName = normalize(`${candidate.lastName} ${candidate.firstName}`);
    const distance = Math.min(levenshtein(q, fullName), levenshtein(q, reverseName));
    return distance / Math.max(q.length, 1);
};

export const pickBestTeacher = <T extends CandidateLike>(
    query: string,
    candidates: T[]
): T | undefined => {
    if (candidates.length === 0) return undefined;
    const ranked = candidates
        .map((c) => ({ c, score: scoreCandidate(query, c) }))
        .sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return b.c.numRatings - a.c.numRatings; // more ratings wins ties
        });
    return ranked[0]?.c;
};
