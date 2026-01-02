import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: "1", name: "Green Valley Apt", total: 12500, balance: 1250, status: "plus", members: 4 },
    { id: "2", name: "Goa Trip 2025", total: 45000, balance: -860, status: "minus", members: 6 },
    { id: "3", name: "Office Lunch", total: 4200, balance: 0, status: "even", members: 3 },
  ]);
}