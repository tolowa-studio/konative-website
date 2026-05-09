import type { Metadata } from 'next'
import GovernorMapClient from './GovernorMapClient'

export const metadata: Metadata = {
  title: 'Governor Brief — Stalled Data Center Projects | Konative',
  description: 'Map of stalled, canceled, paused, and blocked data center projects in NV, WV, FL, and OK — with governor-level context for next-generation green DC outreach.',
}

export default function GovernorsPage() {
  return <GovernorMapClient />
}
