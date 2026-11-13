import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { LanguageProvider } from './i18n/LanguageProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
)
