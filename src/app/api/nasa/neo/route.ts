import { type NextRequest, NextResponse } from "next/server"

const NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1/feed" as const

const getApiKey = (): string => {
  const key = process.env.NASA_API_KEY
  if (!key) {
    return "DEMO_KEY"
  }
  return key
}

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = request.nextUrl

  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing start_date or end_date parameter" },
      { status: 400 }
    )
  }

  const url = new URL(NASA_BASE_URL)
  url.searchParams.set("api_key", getApiKey())
  url.searchParams.set("start_date", startDate)
  url.searchParams.set("end_date", endDate)

  const response = await fetch(url.toString())

  if (!response.ok) {
    return NextResponse.json(
      { error: `NASA API error: ${response.status.toString()}` },
      { status: response.status }
    )
  }

  const data: unknown = await response.json()

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  })
}
