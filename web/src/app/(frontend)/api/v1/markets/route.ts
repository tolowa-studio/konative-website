import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 60

export async function GET() {
  return NextResponse.json([
    { code: 'ASH', market: 'Ashburn, VA', routes: 142, inventoryType: 'Dark Fiber · Colo', index7d: '+4.2%', status: 'ACTIVE' },
    { code: 'NYC', market: 'New York, NY', routes: 118, inventoryType: 'Wavelength · IP', index7d: '−1.8%', status: 'ACTIVE' },
    { code: 'DAL', market: 'Dallas, TX', routes: 96, inventoryType: 'Dark Fiber · Backhaul', index7d: '+6.1%', status: 'ACTIVE' },
    { code: 'CHI', market: 'Chicago, IL', routes: 88, inventoryType: 'Wavelength · Colo', index7d: '+2.4%', status: 'ACTIVE' },
    { code: 'YYZ', market: 'Toronto, ON', routes: 64, inventoryType: 'Cross-Border IP', index7d: 'NEW', status: 'OPENING' },
  ])
}
