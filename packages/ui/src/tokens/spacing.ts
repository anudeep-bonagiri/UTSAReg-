/**
 * Spacing scale — 4px base unit.
 *
 * Why 4px: matches Tailwind's default, halves cleanly into 2px micro-adjustments,
 * and is the most-used scale in productivity-tool design systems. Avoids the
 * "what about 7px" debate by simply not having 7px.
 */
export const spacing = {
    '0': '0',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
    '24': '96px'
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px'
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Shadow tokens, keyed by elevation. Tinted with midnight-blue so they read as
 * intentional rather than gray. Dark mode swaps to neutral black for clarity.
 */
export const lightShadow = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(3, 32, 68, 0.04)',
    md: '0 2px 8px -1px rgba(3, 32, 68, 0.06), 0 1px 3px -1px rgba(3, 32, 68, 0.04)',
    lg: '0 8px 24px -4px rgba(3, 32, 68, 0.10), 0 4px 8px -2px rgba(3, 32, 68, 0.05)',
    xl: '0 20px 40px -8px rgba(3, 32, 68, 0.18), 0 8px 16px -4px rgba(3, 32, 68, 0.08)',
    focus: '0 0 0 3px rgba(241, 90, 34, 0.35)'
} as const;

export const darkShadow: Record<keyof typeof lightShadow, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 2px 8px -1px rgba(0, 0, 0, 0.45), 0 1px 3px -1px rgba(0, 0, 0, 0.35)',
    lg: '0 8px 24px -4px rgba(0, 0, 0, 0.55), 0 4px 8px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5)',
    focus: '0 0 0 3px rgba(255, 110, 54, 0.5)'
};

export type ShadowToken = keyof typeof lightShadow;
