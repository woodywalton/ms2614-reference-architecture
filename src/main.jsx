import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EuiProvider } from '@elastic/eui'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EuiProvider colorMode="dark">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </EuiProvider>
  </React.StrictMode>,
)
