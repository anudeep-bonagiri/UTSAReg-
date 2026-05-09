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

export type WorkerRequest = GetRmpRatingRequest;
export type WorkerResponse<R extends WorkerRequest> = R extends GetRmpRatingRequest
    ? GetRmpRatingResponse
    : never;

/**
 * Typed sendMessage wrapper. Returns the structured response or throws on
 * the underlying chrome.runtime.lastError.
 */
export const sendToBackground = <R extends WorkerRequest>(
    request: R
): Promise<WorkerResponse<R>> =>
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
