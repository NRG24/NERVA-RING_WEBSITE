import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.ts'
import './index.css'
import './subscribed.css'
import Subscribed from './Subscribed.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Subscribed />
  </StrictMode>,
)
