import type { Metadata } from 'next'
import MapPageClient from './MapPageClient'

export const metadata: Metadata = {
  title: 'Connectivity Opportunity Map | Konative',
  description: 'Explore data-center demand, interconnection facilities, power and infrastructure signals across North America, then ask Konative to check a specific location.',
}

export default function MapPage() {
  return <MapPageClient />
}
