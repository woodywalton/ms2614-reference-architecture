import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EuiProvider } from '@elastic/eui'
import { ThemeProvider, useTheme } from './ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

function ThemedApp() {
  const { theme } = useTheme()
  return (
    <EuiProvider colorMode={theme === 'dark' ? 'DARK' : 'LIGHT'}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </EuiProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
)
