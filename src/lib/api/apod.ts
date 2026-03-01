import type { ApodResponse } from "@/types/nasa"
import { nasaFetch } from "./nasa-client"

const APOD_ENDPOINT = "/planetary/apod" as const
const ONE_HOUR = 3600 as const

export const fetchApodToday = (): Promise<ApodResponse> =>
  nasaFetch<ApodResponse>({
    endpoint: APOD_ENDPOINT,
    revalidate: ONE_HOUR,
  })

export const fetchApodByDate = (date: string): Promise<ApodResponse> =>
  nasaFetch<ApodResponse>({
    endpoint: APOD_ENDPOINT,
    params: { date },
  })

export const fetchApodRange = (
  startDate: string,
  endDate: string
): Promise<ReadonlyArray<ApodResponse>> =>
  nasaFetch<ReadonlyArray<ApodResponse>>({
    endpoint: APOD_ENDPOINT,
    params: { start_date: startDate, end_date: endDate },
  })

export const fetchApodRandom = (
  count: number
): Promise<ReadonlyArray<ApodResponse>> =>
  nasaFetch<ReadonlyArray<ApodResponse>>({
    endpoint: APOD_ENDPOINT,
    params: { count: count.toString() },
  })
