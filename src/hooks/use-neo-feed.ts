import { useQuery } from "@tanstack/react-query"
import type { NeoFeedResponse } from "@/types/nasa"
import { QUERY_STALE_TIMES } from "@/lib/constants"

type UseNeoFeedParams = {
  readonly startDate: string
  readonly endDate: string
  readonly isEnabled: boolean
}

const fetchNeoFromProxy = async (
  startDate: string,
  endDate: string
): Promise<NeoFeedResponse> => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  })

  const response = await fetch(`/api/nasa/neo?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch NEO data: ${response.status.toString()}`)
  }

  return response.json() as Promise<NeoFeedResponse>
}

export const useNeoFeed = ({
  startDate,
  endDate,
  isEnabled,
}: UseNeoFeedParams) =>
  useQuery({
    queryKey: ["neo", startDate, endDate],
    queryFn: () => fetchNeoFromProxy(startDate, endDate),
    staleTime: QUERY_STALE_TIMES.NEO,
    enabled: isEnabled && startDate.length > 0 && endDate.length > 0,
  })
