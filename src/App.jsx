import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Overview from './components/Overview.jsx'
import LevelView from './components/LevelView.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-900 text-text-primary">
      <Nav />
      <Routes>
        <Route path="/" element={<Overview />} />
        {/* Bare /level/:id redirects to the small size by default */}
        <Route path="/level/:id" element={<Navigate to="small" replace />} />
        <Route path="/level/:id/:size" element={<LevelView />} />
        <Route path="*" element={<Overview />} />
      </Routes>
      <footer className="mt-12 border-t border-line py-6 text-center text-xs text-text-muted">
        Reference architecture viewer · Static UI · No data is collected or transmitted.
      </footer>
    </div>
  )
}
