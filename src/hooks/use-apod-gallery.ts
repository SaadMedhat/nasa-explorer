import { useQuery } from "@tanstack/react-query"
import type { ApodResponse } from "@/types/nasa"
import { QUERY_STALE_TIMES } from "@/lib/constants"

const fetchFromProxy = async (
  params: Record<string, string>
): Promise<ReadonlyArray<ApodResponse>> => {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/nasa/apod?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch APOD: ${response.status.toString()}`)
  }

  const json = (await response.json()) as
    | ReadonlyArray<ApodResponse>
    | ApodResponse

  /* NASA returns a single object for single-date queries, array for ranges */
  if (Array.isArray(json)) {
    return json as ReadonlyArray<ApodResponse>
  }

  return [json] as ReadonlyArray<ApodResponse>
}

type UseApodRangeParams = {
  readonly startDate: string
  readonly endDate: string
  readonly isEnabled: boolean
}

export const useApodRange = ({
  startDate,
  endDate,
  isEnabled,
}: UseApodRangeParams) =>
  useQuery({
    queryKey: ["apod", "range", startDate, endDate],
    queryFn: () =>
      fetchFromProxy({ start_date: startDate, end_date: endDate }),
    staleTime: QUERY_STALE_TIMES.APOD,
    enabled: isEnabled && startDate.length > 0 && endDate.length > 0,
  })

type UseApodRandomParams = {
  readonly count: number
  readonly isEnabled: boolean
  readonly triggerKey: number
}

export const useApodRandom = ({
  count,
  isEnabled,
  triggerKey,
}: UseApodRandomParams) =>
  useQuery({
    queryKey: ["apod", "random", count, triggerKey],
    queryFn: () => fetchFromProxy({ count: count.toString() }),
    staleTime: 0,
    enabled: isEnabled,
  })
