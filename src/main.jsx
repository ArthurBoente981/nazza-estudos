import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './instalar.js' // precisa ouvir o pedido de instalação antes do React montar
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
