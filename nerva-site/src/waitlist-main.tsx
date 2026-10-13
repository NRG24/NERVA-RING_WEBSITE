import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.ts'
import './index.css'
import './waitlist.css'
import Waitlist from './Waitlist.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Waitlist />
  </StrictMode>,
)
