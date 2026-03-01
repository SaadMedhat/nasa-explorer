import type { MarsPhotosResponse, RoverName, CameraName } from "@/types/nasa"
import { nasaFetch } from "./nasa-client"

type FetchMarsPhotosBySolParams = {
  readonly rover: RoverName
  readonly sol: number
  readonly camera?: CameraName
  readonly page?: number
}

type FetchMarsPhotosByDateParams = {
  readonly rover: RoverName
  readonly earthDate: string
  readonly camera?: CameraName
  readonly page?: number
}

export const fetchMarsPhotosBySol = (
  params: FetchMarsPhotosBySolParams
): Promise<MarsPhotosResponse> => {
  const { rover, sol, camera, page } = params

  return nasaFetch<MarsPhotosResponse>({
    endpoint: `/mars-photos/api/v1/rovers/${rover}/photos`,
    params: {
      sol: sol.toString(),
      camera,
      page: page?.toString(),
    },
  })
}

export const fetchMarsPhotosByDate = (
  params: FetchMarsPhotosByDateParams
): Promise<MarsPhotosResponse> => {
  const { rover, earthDate, camera, page } = params

  return nasaFetch<MarsPhotosResponse>({
    endpoint: `/mars-photos/api/v1/rovers/${rover}/photos`,
    params: {
      earth_date: earthDate,
      camera,
      page: page?.toString(),
    },
  })
}
