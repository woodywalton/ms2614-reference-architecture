import React from 'react'

export default function DeploymentOptions() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Deployment Options</h1>
      <p className="mt-3 text-sm text-text-muted max-w-2xl leading-relaxed">
        M-26-14 compliant architectures can be deployed across several models: Elastic Cloud
        on AWS GovCloud or Azure Government (FedRAMP High), self-managed on-premises, or
        hybrid federated topologies combining both.
      </p>
      <div className="mt-8 rounded-lg border border-line border-dashed bg-ink-800 p-12 text-center">
        <p className="text-text-muted text-sm">Deployment options coming soon.</p>
        <p className="mt-2 text-xs text-text-muted/60">
          Will cover Elastic Cloud, self-managed, and hybrid deployment patterns with sizing
          guidance and FedRAMP authorization details.
        </p>
      </div>
    </main>
  )
}
