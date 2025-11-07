import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Minimal startup logs to help diagnose a blank page in dev
// eslint-disable-next-line no-console
console.log('Starting frontend — mounting React app')

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
