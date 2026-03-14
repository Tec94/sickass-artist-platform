import { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { TestErrorComponent } from '../components/TestErrorComponent'

export const TestErrorPage = () => {
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'validation' | 'unknown' | null>(null)
  const [shouldThrow, setShouldThrow] = useState(false)

  return (
    <div className="app-surface-page min-h-screen p-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="app-surface-shell rounded-2xl p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Internal QA</p>
          <h1 className="mt-3 text-2xl font-display font-semibold text-[var(--color-text-primary)]">Error Boundary Test Page</h1>
        </header>

        <section className="app-surface-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Test Controls</h2>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">Error Type</label>
              <select
                value={errorType || ''}
                onChange={(e) => setErrorType(e.target.value as 'network' | 'auth' | 'validation' | 'unknown')}
                className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-accent-brand-soft)] focus-visible:outline-none"
              >
                <option value="">Select error type</option>
                <option value="network">Network Error</option>
                <option value="auth">Authentication Error</option>
                <option value="validation">Validation Error</option>
                <option value="unknown">Unknown Error</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShouldThrow(true)}
                disabled={!errorType || shouldThrow}
                className={`rounded-md px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] transition ${
                  shouldThrow
                    ? 'cursor-not-allowed border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] text-[var(--color-text-tertiary)]'
                    : 'border border-[var(--color-accent-brand)] bg-[var(--color-accent-brand)] text-[var(--color-accent-brand-foreground)] hover:bg-[var(--color-accent-brand-hover)]'
                }`}
              >
                Trigger Error
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setShouldThrow(false)
              setErrorType(null)
            }}
            className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)]"
          >
            Reset
          </button>
        </section>

        <section className="app-surface-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Page Level Error Boundary</h2>
          <ErrorBoundary level="page">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'network'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </section>

        <section className="app-surface-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Section Level Error Boundary</h2>
          <ErrorBoundary level="section">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'auth'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </section>

        <section className="app-surface-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Component Level Error Boundary</h2>
          <ErrorBoundary level="component">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'validation'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </section>

        <section className="app-surface-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Multiple Error Boundaries</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ErrorBoundary level="section" componentName="Widget1">
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
                <h3 className="mb-2 font-medium text-[var(--color-text-primary)]">Widget 1</h3>
                <TestErrorComponent shouldThrow={shouldThrow && errorType === 'unknown'} errorType={errorType || undefined} />
              </div>
            </ErrorBoundary>

            <ErrorBoundary level="section" componentName="Widget2">
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
                <h3 className="mb-2 font-medium text-[var(--color-text-primary)]">Widget 2</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  This widget should continue working even if Widget 1 fails.
                </p>
              </div>
            </ErrorBoundary>
          </div>
        </section>
      </div>
    </div>
  )
}
