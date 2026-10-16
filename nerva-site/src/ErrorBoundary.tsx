import { Component, type ErrorInfo, type ReactNode } from 'react'

/* One throw in a component used to blank the whole page. This keeps the
   page honest instead: a plain message, the way back, and the contact
   address. Inline styles on purpose, so it still reads if the stylesheet
   was the thing that failed. */
const CONTACT = 'nervaring@gmail.com'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NERVA page error:', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main style={{ maxWidth: '36rem', margin: '18vh auto', padding: '0 20px', font: '17px/1.6 system-ui, sans-serif', color: '#2a2c34' }}>
        <p style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 12px' }}>This page hit a problem.</p>
        <p style={{ margin: '0 0 12px' }}>
          Reloading usually fixes it. If it keeps happening, tell me at{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
        <p style={{ margin: 0 }}>
          <a href="">Reload</a> · <a href="/">Back to nervaring.com</a>
        </p>
      </main>
    )
  }
}
