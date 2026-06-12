import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 300

export async function GET() {
  return NextResponse.json({
    nodes: [
      { x: 16, y: 64, label: 'SJC', major: true },
      { x: 12, y: 44, label: 'SEA', major: false },
      { x: 22, y: 78, label: 'LAX', major: true },
      { x: 30, y: 70, label: 'PHX', major: false },
      { x: 40, y: 80, label: 'DAL', major: true },
      { x: 34, y: 50, label: 'DEN', major: false },
      { x: 56, y: 58, label: 'CHI', major: true },
      { x: 62, y: 80, label: 'ATL', major: true },
      { x: 74, y: 86, label: 'MIA', major: false },
      { x: 82, y: 50, label: 'NYC', major: true },
      { x: 86, y: 42, label: 'BOS', major: false },
      { x: 78, y: 36, label: 'TOR', major: false },
      { x: 70, y: 30, label: 'YYZ', major: false },
      { x: 88, y: 60, label: 'ASH', major: true },
    ],
    routes: [
      { from: 0, to: 1, status: 'indexed' },
      { from: 0, to: 2, status: 'indexed' },
      { from: 2, to: 3, status: 'indexed' },
      { from: 3, to: 4, status: 'indexed' },
      { from: 4, to: 5, status: 'indexed' },
      { from: 5, to: 6, status: 'indexed' },
      { from: 6, to: 7, status: 'active' },
      { from: 7, to: 8, status: 'indexed' },
      { from: 7, to: 9, status: 'active' },
      { from: 9, to: 10, status: 'indexed' },
      { from: 9, to: 13, status: 'active' },
      { from: 6, to: 9, status: 'active' },
      { from: 6, to: 12, status: 'indexed' },
      { from: 12, to: 11, status: 'indexed' },
      { from: 4, to: 7, status: 'active' },
      { from: 3, to: 5, status: 'indexed' },
      { from: 9, to: 11, status: 'indexed' },
      { from: 8, to: 9, status: 'indexed' },
    ],
  })
}
