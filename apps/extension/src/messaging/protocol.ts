import type { Fresh, RmpRating } from '@utsaregplus/core';

/**
 * Typed message protocol between content/popup/dashboard and the background
 * service worker. Every message has a `type` discriminator; responses are
 * typed by the same shape so the React hook layer can sendMessage with full
 * type safety.
 */

export interface GetRmpRatingRequest {
    type: 'getRmpRating';
    instructorName: string;
}

export type GetRmpRatingResponse =
    | { ok: true; result: Fresh<RmpRating> | null }
    | { ok: false; error: string };

export interface SyllabusContext {
    /** Department / college name as Simple Syllabus publishes it. */
    departmentName: string;
    /** Total courses Simple Syllabus tracks for this department. */
    courseCount: number;
    /** Total sections currently published. */
    sectionCount: number;
    /** Public Simple Syllabus library deep-link for the requested course. */
    libraryUrl: string;
    /** ISO timestamp this snapshot was fetched. */
    fetchedAt: string;
}

export interface GetSyllabusContextRequest {
    type: 'getSyllabusContext';
    courseId: string;
}

export type GetSyllabusContextResponse =
    | { ok: true; result: SyllabusContext | null }
    | { ok: false; error: string };

export type WorkerRequest = GetRmpRatingRequest | GetSyllabusContextRequest;
export type WorkerResponse<R extends WorkerRequest> = R extends GetRmpRatingRequest
    ? GetRmpRatingResponse
    : R extends GetSyllabusContextRequest
      ? GetSyllabusContextResponse
      : never;

/**
 * Typed sendMessage wrapper. Returns the structured response or throws on
 * the underlying chrome.runtime.lastError.
 */
export const sendToBackground = <R extends WorkerRequest>(request: R): Promise<WorkerResponse<R>> =>
    new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(request, (response: WorkerResponse<R>) => {
            const lastError = chrome.runtime.lastError;
            if (lastError) {
                reject(new Error(lastError.message ?? 'chrome.runtime sendMessage failed'));
                return;
            }
            resolve(response);
        });
    });
