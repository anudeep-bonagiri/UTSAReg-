import { describe, it, expect, beforeEach } from 'vitest';
import {
    saveCourse,
    getSavedCourses,
    removeCourse,
    clearSavedCourses,
    type SavedCourse
} from './storage';

const sample = (crn: string): SavedCourse => ({
    crn,
    subject: 'CS',
    courseNumber: '3343',
    section: '001',
    title: 'Design Analysis of Algorithms',
    instructor: 'Najem, Z.',
    days: 'MWF',
    time: '12:00-12:50pm',
    room: 'NPB 1.120'
});

describe('savedCourses storage', () => {
    beforeEach(async () => {
        await clearSavedCourses();
    });

    it('starts empty', async () => {
        expect(await getSavedCourses()).toEqual([]);
    });

    it('saves a single course', async () => {
        await saveCourse(sample('10184'));
        const saved = await getSavedCourses();
        expect(saved).toHaveLength(1);
        expect(saved[0]?.crn).toBe('10184');
    });

    it('does not duplicate the same CRN', async () => {
        await saveCourse(sample('10184'));
        await saveCourse(sample('10184'));
        expect((await getSavedCourses()).length).toBe(1);
    });

    it('removes a course by CRN', async () => {
        await saveCourse(sample('10184'));
        await saveCourse(sample('19697'));
        await removeCourse('10184');
        const saved = await getSavedCourses();
        expect(saved).toHaveLength(1);
        expect(saved[0]?.crn).toBe('19697');
    });

    it('clears all', async () => {
        await saveCourse(sample('10184'));
        await saveCourse(sample('19697'));
        await clearSavedCourses();
        expect(await getSavedCourses()).toEqual([]);
    });
});
