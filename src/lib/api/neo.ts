import type { NeoFeedResponse } from "@/types/nasa"
import { nasaFetch } from "./nasa-client"

const NEO_ENDPOINT = "/neo/rest/v1/feed" as const

type FetchNeoFeedParams = {
  readonly startDate: string
  readonly endDate: string
}

export const fetchNeoFeed = (
  params: FetchNeoFeedParams
): Promise<NeoFeedResponse> => {
  const { startDate, endDate } = params

  return nasaFetch<NeoFeedResponse>({
    endpoint: NEO_ENDPOINT,
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
}
