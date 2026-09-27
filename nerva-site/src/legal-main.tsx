import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.ts'
import './index.css'
import './legal.css'
import Legal from './Legal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Legal />
  </StrictMode>,
)
