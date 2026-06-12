import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 30

export async function GET() {
  return NextResponse.json([
    { route: 'ASH→NYC', metric: 'Dark fiber', value: '+2 routes', direction: 'up' },
    { route: 'DAL→ATL', metric: 'Wavelength 400G', value: '−6.2%', direction: 'down' },
    { route: 'SJC→SEA', metric: 'Colocation', value: '3 quotes', direction: 'up' },
    { route: 'CHI→TOR', metric: 'Cross-border IP', value: 'Live', direction: 'up' },
    { route: 'LAX→PHX', metric: 'Backhaul', value: '+1.8%', direction: 'up' },
    { route: 'YYZ→MTL', metric: 'Dark fiber', value: '−4.0%', direction: 'down' },
    { route: 'MIA→ATL', metric: 'Wavelength 100G', value: '5 quotes', direction: 'up' },
    { route: 'DEN→SLC', metric: 'Colocation', value: 'New', direction: 'up' },
  ])
}
