import { useEffect, useState } from 'react';
import { sendToBackground, type SyllabusContext } from '../messaging/protocol.js';

export interface UseSyllabusContextState {
    data: SyllabusContext | null;
    loading: boolean;
    error: string | null;
}

/**
 * Live look-up of a course's syllabus library context. Sends a single
 * background message; the worker handles the (rare) network fetch and
 * its own per-session cache.
 */
export const useSyllabusContext = (courseId: string | undefined): UseSyllabusContextState => {
    const [state, setState] = useState<UseSyllabusContextState>({
        data: null,
        loading: Boolean(courseId),
        error: null
    });

    useEffect(() => {
        if (!courseId) {
            setState({ data: null, loading: false, error: null });
            return;
        }
        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: null }));
        sendToBackground({ type: 'getSyllabusContext', courseId })
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
    }, [courseId]);

    return state;
};
