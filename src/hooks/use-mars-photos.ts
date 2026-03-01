import { useQuery } from "@tanstack/react-query"
import type { MarsPhotosResponse, RoverName, CameraName } from "@/types/nasa"
import { QUERY_STALE_TIMES } from "@/lib/constants"

type UseMarsPhotosParams = {
  readonly rover: RoverName
  readonly sol: string
  readonly camera: CameraName | "all"
  readonly isEnabled: boolean
}

const fetchMarsFromProxy = async (
  params: Record<string, string>
): Promise<MarsPhotosResponse> => {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/nasa/mars?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch Mars photos: ${response.status.toString()}`)
  }

  return response.json() as Promise<MarsPhotosResponse>
}

export const useMarsPhotos = ({
  rover,
  sol,
  camera,
  isEnabled,
}: UseMarsPhotosParams) =>
  useQuery({
    queryKey: ["mars", rover, sol, camera],
    queryFn: () => {
      const params: Record<string, string> = {
        rover,
        sol,
      }

      if (camera !== "all") {
        params["camera"] = camera
      }

      return fetchMarsFromProxy(params)
    },
    staleTime: QUERY_STALE_TIMES.MARS,
    enabled: isEnabled && sol.length > 0,
  })
