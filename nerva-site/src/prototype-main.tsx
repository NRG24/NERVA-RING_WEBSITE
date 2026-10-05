import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.ts'
import './index.css'
import './prototype.css'
import Prototype from './Prototype.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Prototype />
  </StrictMode>,
)
