import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    /** Optional surface label so the recovery message can name the surface ("Popup" / "Dashboard"). */
    surface?: string;
}

interface State {
    error: Error | null;
}

/**
 * Root error boundary. Catches any render error in its subtree and shows a
 * recovery card branded with UTSA tokens instead of the white-screen-of-death.
 *
 * This is intentionally a minimal class component (the only React API that
 * captures render errors). Reset is a hard reload of the surface — simplest
 * thing that actually works in a Chrome extension surface.
 */
export class ErrorBoundary extends Component<Props, State> {
    override state: State = { error: null };

    static getDerivedStateFromError(error: unknown): State {
        return {
            error: error instanceof Error ? error : new Error(String(error))
        };
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        // No remote logging on purpose — privacy promise. Local console only.
        console.error('[utsa-reg+] render error', error, info.componentStack);
    }

    private handleReload = (): void => {
        this.setState({ error: null });
        window.location.reload();
    };

    override render(): ReactNode {
        if (!this.state.error) return this.props.children;
        const surfaceName = this.props.surface ?? 'Surface';
        return (
            <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-[var(--surface-canvas)]">
                <div className="max-w-md w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
                    <div className="bg-[var(--brand-default)] text-white p-5 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-default)]" />
                        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[var(--brand-soft)]">
                            {surfaceName} · Recovery
                        </div>
                        <h2 className="utsa-display-black text-[22px] mt-2 leading-tight text-white">
                            Something broke.
                        </h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-[13px] text-[var(--ink-default)] leading-relaxed">
                            UTSA Reg+ hit a runtime error and bailed out so it didn’t corrupt your
                            saved schedule. Your data is safe in chrome.storage.
                        </p>
                        <pre className="text-[11px] bg-[var(--surface-sunken)] text-[var(--ink-default)] p-3 rounded-lg overflow-x-auto utsa-tabular">
                            {this.state.error.message}
                        </pre>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="w-full bg-[var(--accent-default)] hover:bg-[var(--accent-hover)] text-white font-semibold py-2.5 rounded-lg transition-colors text-[13px]"
                        >
                            Reload {surfaceName.toLowerCase()}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
