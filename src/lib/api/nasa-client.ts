const NASA_BASE_URL = "https://api.nasa.gov" as const

const getApiKey = (): string => {
  const key = process.env.NASA_API_KEY
  if (!key) {
    return "DEMO_KEY"
  }
  return key
}

type NasaFetchOptions = {
  readonly endpoint: string
  readonly params?: Readonly<Record<string, string | undefined>>
  readonly revalidate?: number
}

export const nasaFetch = async <T>(options: NasaFetchOptions): Promise<T> => {
  const { endpoint, params = {}, revalidate } = options

  const url = new URL(endpoint, NASA_BASE_URL)
  url.searchParams.set("api_key", getApiKey())

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, value)
    }
  })

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {}

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate }
  }

  const response = await fetch(url.toString(), fetchOptions)

  if (!response.ok) {
    throw new Error(
      `NASA API error: ${response.status.toString()} ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}
