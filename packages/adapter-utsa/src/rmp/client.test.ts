import { describe, it, expect, vi } from 'vitest';
import { RmpClient, RmpHttpError, RmpGraphQLError } from './client.js';
import { fetchRatingForInstructor, resolveUtsaSchoolId } from './index.js';

/**
 * Tests for the RMP client run against a fake fetch — no network. The
 * smoke test in scripts/smoke-rmp.ts is what verifies real connectivity.
 */

const utsaSchoolNode = {
    id: 'U2Nob29sLTExOTg=',
    name: 'University of Texas at San Antonio',
    city: 'San Antonio',
    state: 'TX',
    legacyId: 1198
};

const jadliwalaNode = {
    id: 'VGVhY2hlci1Z',
    legacyId: 1234567,
    firstName: 'Murtuza',
    lastName: 'Jadliwala',
    department: 'Computer Science',
    avgRating: 4.8,
    numRatings: 45,
    avgDifficulty: 3.2,
    wouldTakeAgainPercent: 92,
    school: { id: utsaSchoolNode.id, name: utsaSchoolNode.name }
};

const mkResponse = (body: unknown, init: ResponseInit = { status: 200 }) =>
    Promise.resolve(new Response(JSON.stringify(body), init));

describe('RmpClient.findSchool', () => {
    it('returns the first edge node from a SchoolSearch response', async () => {
        const fetchImpl = vi.fn(() =>
            mkResponse({
                data: {
                    newSearch: {
                        schools: { edges: [{ cursor: 'a', node: utsaSchoolNode }] }
                    }
                }
            })
        );
        const client = new RmpClient({ fetchImpl });
        const node = await client.findSchool('UTSA');
        expect(node?.legacyId).toBe(1198);

        // Verify outbound shape: POST + Authorization + JSON body with query+variables
        expect(fetchImpl).toHaveBeenCalledOnce();
        const [, init] = fetchImpl.mock.calls[0]!;
        expect(init?.method).toBe('POST');
        const headers = init?.headers as Record<string, string>;
        expect(headers.Authorization).toMatch(/^Basic /);
        const body = JSON.parse(String(init?.body)) as { query: string; variables: unknown };
        expect(body.query).toContain('NewSearchSchoolsQuery');
        expect(body.variables).toEqual({ query: { text: 'UTSA' } });
    });

    it('returns undefined when no schools match', async () => {
        const client = new RmpClient({
            fetchImpl: () => mkResponse({ data: { newSearch: { schools: { edges: [] } } } })
        });
        expect(await client.findSchool('Nowhere U')).toBeUndefined();
    });

    it('throws RmpHttpError on non-2xx HTTP responses', async () => {
        const client = new RmpClient({
            fetchImpl: () => mkResponse({}, { status: 500, statusText: 'Server Error' })
        });
        await expect(client.findSchool('UTSA')).rejects.toBeInstanceOf(RmpHttpError);
    });

    it('throws RmpGraphQLError when the response body has errors', async () => {
        const client = new RmpClient({
            fetchImpl: () => mkResponse({ errors: [{ message: 'Bad query' }], data: null })
        });
        await expect(client.findSchool('UTSA')).rejects.toBeInstanceOf(RmpGraphQLError);
    });

    it('aborts after the timeout', async () => {
        const client = new RmpClient({
            timeoutMs: 5,
            fetchImpl: ((_url: string, init?: RequestInit) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => {
                        reject(new DOMException('aborted', 'AbortError'));
                    });
                })) as unknown as typeof fetch
        });
        await expect(client.findSchool('UTSA')).rejects.toThrow(/aborted/i);
    });
});

describe('resolveUtsaSchoolId', () => {
    it('returns the GraphQL ID when the response is the real UTSA', async () => {
        const client = new RmpClient({
            fetchImpl: () =>
                mkResponse({
                    data: {
                        newSearch: { schools: { edges: [{ node: utsaSchoolNode }] } }
                    }
                })
        });
        expect(await resolveUtsaSchoolId(client)).toBe(utsaSchoolNode.id);
    });

    it('throws when RMP returns no schools', async () => {
        const client = new RmpClient({
            fetchImpl: () => mkResponse({ data: { newSearch: { schools: { edges: [] } } } })
        });
        await expect(resolveUtsaSchoolId(client)).rejects.toThrow(/Could not resolve/);
    });

    it('throws when RMP returns a same-named non-UTSA school', async () => {
        const imposter = {
            ...utsaSchoolNode,
            name: 'University of Whatever',
            city: 'Houston',
            state: 'TX'
        };
        const client = new RmpClient({
            fetchImpl: () =>
                mkResponse({
                    data: { newSearch: { schools: { edges: [{ node: imposter }] } } }
                })
        });
        await expect(resolveUtsaSchoolId(client)).rejects.toThrow(/non-UTSA/);
    });
});

describe('fetchRatingForInstructor', () => {
    it('returns the parsed best-match teacher', async () => {
        const client = new RmpClient({
            fetchImpl: () =>
                mkResponse({
                    data: {
                        newSearch: {
                            teachers: { edges: [{ node: jadliwalaNode }] }
                        }
                    }
                })
        });
        const result = await fetchRatingForInstructor(client, {
            instructorName: 'Jadliwala, Murtuza',
            schoolId: utsaSchoolNode.id
        });
        expect(result?.data.name).toBe('Murtuza Jadliwala');
        expect(result?.data.avgRating).toBe(4.8);
        expect(result?.freshness.source).toBe('live');
    });

    it('returns null when no teachers match', async () => {
        const client = new RmpClient({
            fetchImpl: () => mkResponse({ data: { newSearch: { teachers: { edges: [] } } } })
        });
        const result = await fetchRatingForInstructor(client, {
            instructorName: 'Nobody Here',
            schoolId: utsaSchoolNode.id
        });
        expect(result).toBeNull();
    });

    it('picks the best match when multiple candidates returned', async () => {
        const client = new RmpClient({
            fetchImpl: () =>
                mkResponse({
                    data: {
                        newSearch: {
                            teachers: {
                                edges: [
                                    { node: { ...jadliwalaNode, firstName: 'Marina' } },
                                    { node: jadliwalaNode }
                                ]
                            }
                        }
                    }
                })
        });
        const result = await fetchRatingForInstructor(client, {
            instructorName: 'Murtuza Jadliwala',
            schoolId: utsaSchoolNode.id
        });
        expect(result?.data.name).toBe('Murtuza Jadliwala');
    });
});
