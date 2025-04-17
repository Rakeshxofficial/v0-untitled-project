import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Content-Type": "text/html",
    },
  })
}
