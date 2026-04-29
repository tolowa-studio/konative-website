'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

const NO_FOOTER_ROUTES = ['/map']

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (NO_FOOTER_ROUTES.includes(pathname)) return null
  return <Footer />
}
