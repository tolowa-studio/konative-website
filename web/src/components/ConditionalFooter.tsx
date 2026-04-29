'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname === '/map' || pathname === '/for' || pathname.startsWith('/for/')) return null
  return <Footer />
}
