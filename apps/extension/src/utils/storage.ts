export interface SavedCourse {
    crn: string;
    subject: string;
    courseNumber: string;
    section: string;
    title: string;
    instructor: string;
    days: string;
    time: string;
    room: string;
}

export const saveCourse = async (course: SavedCourse): Promise<void> => {
    const result = await chrome.storage.local.get('savedCourses');
    const savedCourses = (result.savedCourses as SavedCourse[]) || [];

    if (!savedCourses.some((c: SavedCourse) => c.crn === course.crn)) {
        const updated = [...savedCourses, course];
        await chrome.storage.local.set({ savedCourses: updated });
        console.info(`[utsa-reg+] saved course ${course.crn}`);
    }
};

export const getSavedCourses = async (): Promise<SavedCourse[]> => {
    const result = await chrome.storage.local.get('savedCourses');
    return (result.savedCourses as SavedCourse[]) || [];
};

export const removeCourse = async (crn: string): Promise<void> => {
    const result = await chrome.storage.local.get('savedCourses');
    const savedCourses = (result.savedCourses as SavedCourse[]) || [];
    const updated = savedCourses.filter((c: SavedCourse) => c.crn !== crn);
    await chrome.storage.local.set({ savedCourses: updated });
};

export const clearSavedCourses = async (): Promise<void> => {
    await chrome.storage.local.set({ savedCourses: [] });
};
