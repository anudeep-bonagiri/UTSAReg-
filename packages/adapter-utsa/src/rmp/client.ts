import {
    RMP_AUTH_HEADER,
    RMP_ENDPOINT,
    SCHOOL_SEARCH_QUERY,
    TEACHER_SEARCH_QUERY
} from './queries.js';
import {
    RmpErrorResponseSchema,
    RmpSchoolSearchResponseSchema,
    RmpTeacherSearchResponseSchema,
    type RmpSchoolNode,
    type RmpTeacherNode
} from './types.js';

/**
 * Minimal typed GraphQL client for RMP.
 *
 * Constructor takes a fetch implementation so the same code runs in:
 *   - Service-worker / browser (uses globalThis.fetch)
 *   - Node tests (vi.fn() mock)
 *   - Future server-side cron (node:undici fetch)
 */

export interface RmpClientOptions {
    fetchImpl?: typeof fetch;
    /** Override the endpoint (e.g. mock server). */
    endpoint?: string;
    /** Override the Authorization header. */
    authHeader?: string;
    /** Hard-stop after N ms; throws AbortError. */
    timeoutMs?: number;
}

export class RmpHttpError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = 'RmpHttpError';
    }
}

export class RmpGraphQLError extends Error {
    constructor(
        public readonly errors: readonly { message: string }[],
        public readonly raw: unknown
    ) {
        super(errors.map((e) => e.message).join('; ') || 'RMP GraphQL error');
        this.name = 'RmpGraphQLError';
    }
}

export class RmpClient {
    private readonly fetchImpl: typeof fetch;
    private readonly endpoint: string;
    private readonly authHeader: string;
    private readonly timeoutMs: number;

    constructor(options: RmpClientOptions = {}) {
        this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
        this.endpoint = options.endpoint ?? RMP_ENDPOINT;
        this.authHeader = options.authHeader ?? RMP_AUTH_HEADER;
        this.timeoutMs = options.timeoutMs ?? 8000;
    }

    /** Generic GraphQL POST. Returns raw JSON for the caller to validate. */
    private async query<TVars extends object>(query: string, variables: TVars): Promise<unknown> {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
        }, this.timeoutMs);
        try {
            const res = await this.fetchImpl(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.authHeader,
                    Accept: 'application/json'
                },
                body: JSON.stringify({ query, variables }),
                signal: controller.signal
            });
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                throw new RmpHttpError(
                    res.status,
                    `RMP HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`
                );
            }
            const json: unknown = await res.json();

            // GraphQL errors come back with HTTP 200 — pull them out explicitly.
            const maybeErrors = RmpErrorResponseSchema.safeParse(json);
            if (maybeErrors.success && maybeErrors.data.errors?.length) {
                throw new RmpGraphQLError(maybeErrors.data.errors, json);
            }
            return json;
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Find a school by free-text name. Returns the best-match node (first
     * edge) or undefined when there are no results. Throws on transport
     * errors (HTTP non-200, GraphQL errors, abort).
     */
    async findSchool(name: string): Promise<RmpSchoolNode | undefined> {
        const raw = await this.query(SCHOOL_SEARCH_QUERY, { query: { text: name } });
        const parsed = RmpSchoolSearchResponseSchema.parse(raw);
        return parsed.data.newSearch.schools.edges[0]?.node;
    }

    /**
     * Search for a teacher by name within a specific school. Returns ALL
     * matches (caller picks best fit via Levenshtein or exact-match logic).
     */
    async searchTeachers(opts: { name: string; schoolId: string }): Promise<RmpTeacherNode[]> {
        const raw = await this.query(TEACHER_SEARCH_QUERY, {
            query: { text: opts.name, schoolID: opts.schoolId }
        });
        const parsed = RmpTeacherSearchResponseSchema.parse(raw);
        return parsed.data.newSearch.teachers.edges.map((e) => e.node);
    }
}
