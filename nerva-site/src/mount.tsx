import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './ErrorBoundary.tsx'

/* every entry point mounts through here, so every page gets the boundary */
export function mount(page: ReactNode) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>{page}</ErrorBoundary>
    </StrictMode>,
  )
}
