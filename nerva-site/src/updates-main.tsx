import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './buy.css'
import './updates.css'
import Updates from './Updates.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Updates />
  </StrictMode>,
)
