/**
 * GraphQL queries against ratemyprofessors.com.
 *
 * Endpoint: https://www.ratemyprofessors.com/graphql
 * Auth: Authorization header `Basic dGVzdDp0ZXN0` (i.e. test:test). This
 * happens to be the public-facing credential RMP's own front-end uses for
 * unauthenticated reads. We document it explicitly so the choice is visible.
 *
 * Schema reverse-engineered against the live API as of May 2026. If RMP
 * tightens auth in the future, this is where to swap in a different scheme.
 */

export const RMP_ENDPOINT = 'https://www.ratemyprofessors.com/graphql';
export const RMP_AUTH_HEADER = 'Basic dGVzdDp0ZXN0';

/**
 * Resolve a school's GraphQL ID by name. We never hardcode UTSA's ID — the
 * runtime lookup means the adapter still works if RMP ever re-IDs schools.
 *
 * Variables:
 *   query: { text: "University of Texas at San Antonio" }
 *
 * Response shape (relevant slice):
 *   newSearch.schools.edges[0].node.{ id, name, city, state }
 */
export const SCHOOL_SEARCH_QUERY = /* GraphQL */ `
    query NewSearchSchoolsQuery($query: SchoolSearchQuery!) {
        newSearch {
            schools(query: $query) {
                edges {
                    cursor
                    node {
                        id
                        name
                        city
                        state
                        legacyId
                    }
                }
            }
        }
    }
`;

/**
 * Search for an instructor by name within a specific school. The first
 * edge with a matching name is the most-likely match; tie-breaking happens
 * at parse time (closest Levenshtein distance to query).
 *
 * Variables:
 *   query: { text: "Murtuza Jadliwala", schoolID: "U2Nob29sLTExOTg=" }
 */
export const TEACHER_SEARCH_QUERY = /* GraphQL */ `
    query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
        newSearch {
            teachers(query: $query) {
                edges {
                    cursor
                    node {
                        id
                        legacyId
                        firstName
                        lastName
                        department
                        avgRating
                        numRatings
                        avgDifficulty
                        wouldTakeAgainPercent
                        school {
                            id
                            name
                        }
                    }
                }
            }
        }
    }
`;
