import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { ScheduleProvider } from './state/ScheduleProvider.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Missing #root element in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <ScheduleProvider>
      <App />
    </ScheduleProvider>
  </StrictMode>,
)
