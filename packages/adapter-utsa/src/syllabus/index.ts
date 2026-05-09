export {
    SIMPLE_SYLLABUS_BASE,
    SyllabusFetchError,
    fetchUtsaOrganizations,
    fetchUtsaTerms,
    buildLibrarySearchUrl,
    type SyllabusClientOptions
} from './client.js';
export { findDepartmentForSubject, subjectFromCourseId } from './match.js';
export {
    SyllabusOrganizationSchema,
    SyllabusTermSchema,
    type SyllabusOrganization,
    type SyllabusTerm
} from './types.js';
