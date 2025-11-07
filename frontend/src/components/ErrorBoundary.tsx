import React from 'react'

type State = { error: Error | null }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console for now; can be extended to report errors remotely
    // Keep this synchronous and minimal so it never throws.
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#a00' }}>{String(this.state.error?.message || 'Unknown error')}</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: 12 }}>
            {String(this.state.error?.stack || '')}
          </pre>
        </div>
      )
    }
    return this.props.children as any
  }
}
