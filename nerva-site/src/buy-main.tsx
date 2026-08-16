import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './buy.css'
import Buy from './Buy.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Buy />
  </StrictMode>,
)
