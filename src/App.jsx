import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Overview from './components/Overview.jsx'
import LevelView from './components/LevelView.jsx'
import MaturityView from './components/MaturityView.jsx'
import AssetInventory from './components/AssetInventory.jsx'
import DeploymentOptions from './components/DeploymentOptions.jsx'
import CompliancePage from './components/CompliancePage.jsx'

function MaturitySizeRedirect() {
  const { size } = useParams()
  return <Navigate to={`/maturity/${size}/1`} replace />
}

export default function App() {
  return (
    <div className="min-h-screen bg-ink-900 text-text-primary pb-8">
      <Nav />
      <Routes>
        {/* Overview / home */}
        <Route path="/" element={<Overview />} />

        {/* Maturity × org-size view */}
        <Route path="/maturity" element={<Navigate to="/maturity/small/1" replace />} />
        <Route path="/maturity/:size" element={<MaturitySizeRedirect />} />
        <Route path="/maturity/:size/:level" element={<MaturityView />} />

        {/* Per-level detail view (existing) */}
        <Route path="/level/:id" element={<Navigate to="small" replace />} />
        <Route path="/level/:id/:size" element={<LevelView />} />

        {/* Compliance story page */}
        <Route path="/compliance" element={<CompliancePage />} />

        {/* Browse nav stub pages */}
        <Route path="/asset-inventory" element={<AssetInventory />} />
        <Route path="/deployment-options" element={<DeploymentOptions />} />

        <Route path="*" element={<Overview />} />
      </Routes>
      <footer className="fixed bottom-0 inset-x-0 z-10 border-t border-line bg-ink-900/90 backdrop-blur py-1.5 text-center text-[11px] text-text-muted/60">
        © 2026 Elastic · Reference architecture viewer · Static UI · No data is collected or transmitted.
      </footer>
    </div>
  )
}
