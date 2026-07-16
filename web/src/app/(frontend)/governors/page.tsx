import type { Metadata } from 'next'
import GovernorMapClient from './GovernorMapClient'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Governor Brief — Live & Stalled Data Center Projects | Konative',
  description: 'Interactive map of live, stalled, and tribal data center projects across all 50 US states — with governor-level policy context and US/Canada First Nations coverage.',
}

export default function GovernorsPage() {
  return <GovernorMapClient />
}
