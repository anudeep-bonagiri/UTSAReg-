/**
 * Motion tokens. Keep the animation vocabulary small and purposeful.
 *
 * Three durations:
 *   - quick (120ms): hover/active state changes — feels instant
 *   - default (200ms): tab switches, accordions
 *   - emphasized (320ms): dialogs entering, big layout shifts
 *
 * Two easings:
 *   - standard: ease-out, the default. Feels responsive.
 *   - emphasized: a slight overshoot for entry animations.
 *
 * Prefers-reduced-motion is honored at the CSS layer in styles/index.css —
 * those users get instant transitions instead of animations.
 */
export const motion = {
    duration: {
        quick: '120ms',
        default: '200ms',
        emphasized: '320ms'
    },
    easing: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        emphasized: 'cubic-bezier(0.3, 0, 0, 1.05)',
        linear: 'linear'
    }
} as const;

export type DurationToken = keyof typeof motion.duration;
export type EasingToken = keyof typeof motion.easing;
