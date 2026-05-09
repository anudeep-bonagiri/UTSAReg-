import { useEffect, useState } from 'react';
import type { Fresh, RmpRating } from '@utsaregplus/core';
import { sendToBackground } from '../messaging/protocol.js';

export interface UseRmpRatingState {
    /** The rating envelope, or null when no instructor matched. */
    data: Fresh<RmpRating> | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook for components: pass an instructor name, get the live (or cached)
 * RmpRating with freshness metadata. Background worker handles SWR; this
 * hook is a thin React wrapper.
 *
 * Pass undefined / empty string / "TBA" to skip — the hook returns instantly.
 */
export const useRmpRating = (instructorName: string | undefined): UseRmpRatingState => {
    const [state, setState] = useState<UseRmpRatingState>({
        data: null,
        loading: Boolean(instructorName) && instructorName !== 'TBA',
        error: null
    });

    useEffect(() => {
        if (!instructorName || instructorName === 'TBA') {
            setState({ data: null, loading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: null }));

        sendToBackground({ type: 'getRmpRating', instructorName })
            .then((response) => {
                if (cancelled) return;
                if (response.ok) {
                    setState({ data: response.result, loading: false, error: null });
                } else {
                    setState({ data: null, loading: false, error: response.error });
                }
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setState({
                    data: null,
                    loading: false,
                    error: err instanceof Error ? err.message : String(err)
                });
            });

        return () => {
            cancelled = true;
        };
    }, [instructorName]);

    return state;
};
