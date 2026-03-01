import { type NextRequest, NextResponse } from "next/server"

const NASA_BASE_URL = "https://api.nasa.gov/planetary/apod" as const

const getApiKey = (): string => {
  const key = process.env.NASA_API_KEY
  if (!key) {
    return "DEMO_KEY"
  }
  return key
}

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = request.nextUrl

  const url = new URL(NASA_BASE_URL)
  url.searchParams.set("api_key", getApiKey())

  const allowedParams = ["date", "start_date", "end_date", "count"] as const
  allowedParams.forEach((param) => {
    const value = searchParams.get(param)
    if (value) {
      url.searchParams.set(param, value)
    }
  })

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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  })
}
