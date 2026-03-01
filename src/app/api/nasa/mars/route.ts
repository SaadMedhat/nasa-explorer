import { type NextRequest, NextResponse } from "next/server"

/* ─── Endpoints ─── */

const CURIOSITY_API = "https://mars.nasa.gov/api/v1/raw_image_items" as const
const PERSEVERANCE_API = "https://mars.nasa.gov/rss/api" as const

const PER_PAGE = 50 as const

/* ─── Curiosity (MSL) ─── */

type CuriosityItem = {
  readonly id: number
  readonly sol: number
  readonly instrument: string
  readonly url: string
  readonly https_url: string
  readonly title: string
  readonly date_taken: string
  readonly image_credit: string
}

type CuriosityResponse = {
  readonly items: ReadonlyArray<CuriosityItem>
  readonly total: number
  readonly page: number
}

const fetchCuriosity = async (
  sol: string,
  camera: string | null,
  page: string
): Promise<Response> => {
  const url = new URL(CURIOSITY_API)
  url.searchParams.set("per_page", PER_PAGE.toString())
  url.searchParams.set("page", page)
  url.searchParams.set("order", "sol desc")
  url.searchParams.set("condition_1", "msl:mission")
  url.searchParams.set("condition_2", `${sol}:sol`)

  if (camera) {
    url.searchParams.set("condition_3", `${camera}:instrument`)
  }

  return fetch(url.toString())
}

const normalizeCuriosity = (data: CuriosityResponse): NormalizedResponse => ({
  photos: data.items.map((item) => ({
    id: item.id.toString(),
    sol: item.sol,
    camera: item.instrument,
    imageUrl: item.https_url || item.url,
    title: item.title,
    dateTaken: item.date_taken,
    credit: item.image_credit,
  })),
  total: data.total,
})

/* ─── Perseverance (Mars 2020) ─── */

type PerseveranceImageFiles = {
  readonly medium: string
  readonly small: string
  readonly full_res: string
  readonly large: string
}

type PerseveranceCamera = {
  readonly instrument: string
}

type PerseveranceItem = {
  readonly imageid: string
  readonly sol: number
  readonly camera: PerseveranceCamera
  readonly image_files: PerseveranceImageFiles
  readonly title: string
  readonly date_taken_utc: string
  readonly credit: string
}

type PerseveranceResponse = {
  readonly images: ReadonlyArray<PerseveranceItem>
  readonly total_images: number
}

const fetchPerseverance = async (
  sol: string,
  camera: string | null,
  page: string
): Promise<Response> => {
  const url = new URL(PERSEVERANCE_API)
  url.searchParams.set("feed", "raw_images")
  url.searchParams.set("category", "mars2020")
  url.searchParams.set("feedtype", "json")
  url.searchParams.set("num", PER_PAGE.toString())
  url.searchParams.set("page", page)
  url.searchParams.set("sol", sol)

  if (camera) {
    url.searchParams.set("camera", camera)
  }

  return fetch(url.toString())
}

const normalizePerseverance = (data: PerseveranceResponse): NormalizedResponse => ({
  photos: data.images.map((item) => ({
    id: item.imageid,
    sol: item.sol,
    camera: item.camera.instrument,
    imageUrl: item.image_files.large || item.image_files.medium,
    title: item.title,
    dateTaken: item.date_taken_utc,
    credit: item.credit,
  })),
  total: data.total_images ?? data.images.length,
})

/* ─── Normalized response ─── */

type NormalizedPhoto = {
  readonly id: string
  readonly sol: number
  readonly camera: string
  readonly imageUrl: string
  readonly title: string
  readonly dateTaken: string
  readonly credit: string
}

type NormalizedResponse = {
  readonly photos: ReadonlyArray<NormalizedPhoto>
  readonly total: number
}

/* ─── Route handler ─── */

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = request.nextUrl

  const rover = searchParams.get("rover")
  if (!rover) {
    return NextResponse.json(
      { error: "Missing rover parameter" },
      { status: 400 }
    )
  }

  const sol = searchParams.get("sol") ?? "1"
  const camera = searchParams.get("camera")
  const page = searchParams.get("page") ?? "0"

  const response =
    rover === "perseverance"
      ? await fetchPerseverance(sol, camera, page)
      : await fetchCuriosity(sol, camera, page)

  if (!response.ok) {
    return NextResponse.json(
      { error: `NASA API error: ${response.status.toString()}` },
      { status: response.status }
    )
  }

  const raw: unknown = await response.json()

  const normalized =
    rover === "perseverance"
      ? normalizePerseverance(raw as PerseveranceResponse)
      : normalizeCuriosity(raw as CuriosityResponse)

  return NextResponse.json(normalized, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  })
}
