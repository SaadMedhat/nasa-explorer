/* ─── APOD ─── */

export type ApodMediaType = "image" | "video"

export type ApodResponse = {
  readonly copyright?: string
  readonly date: string
  readonly explanation: string
  readonly hdurl?: string
  readonly media_type: ApodMediaType
  readonly service_version: string
  readonly title: string
  readonly url: string
}

/* ─── Mars Rover Photos ─── */

export type MarsPhoto = {
  readonly id: string
  readonly sol: number
  readonly camera: string
  readonly imageUrl: string
  readonly title: string
  readonly dateTaken: string
  readonly credit: string
}

export type MarsPhotosResponse = {
  readonly photos: ReadonlyArray<MarsPhoto>
  readonly total: number
}

/* ─── Near Earth Objects ─── */

export type NeoEstimatedDiameter = {
  readonly estimated_diameter_min: number
  readonly estimated_diameter_max: number
}

export type NeoCloseApproachData = {
  readonly close_approach_date: string
  readonly close_approach_date_full: string
  readonly epoch_date_close_approach: number
  readonly relative_velocity: {
    readonly kilometers_per_second: string
    readonly kilometers_per_hour: string
    readonly miles_per_hour: string
  }
  readonly miss_distance: {
    readonly astronomical: string
    readonly lunar: string
    readonly kilometers: string
    readonly miles: string
  }
  readonly orbiting_body: string
}

export type NeoObject = {
  readonly id: string
  readonly neo_reference_id: string
  readonly name: string
  readonly nasa_jpl_url: string
  readonly absolute_magnitude_h: number
  readonly estimated_diameter: {
    readonly kilometers: NeoEstimatedDiameter
    readonly meters: NeoEstimatedDiameter
    readonly miles: NeoEstimatedDiameter
    readonly feet: NeoEstimatedDiameter
  }
  readonly is_potentially_hazardous_asteroid: boolean
  readonly close_approach_data: ReadonlyArray<NeoCloseApproachData>
  readonly is_sentry_object: boolean
}

export type NeoFeedResponse = {
  readonly links: {
    readonly next: string
    readonly previous: string
    readonly self: string
  }
  readonly element_count: number
  readonly near_earth_objects: Readonly<Record<string, ReadonlyArray<NeoObject>>>
}

/* ─── Shared ─── */

export type RoverName = "curiosity" | "perseverance"

export type CuriosityCameraName =
  | "FHAZ_LEFT_B"
  | "FHAZ_RIGHT_B"
  | "RHAZ_LEFT_B"
  | "RHAZ_RIGHT_B"
  | "MAST_LEFT"
  | "MAST_RIGHT"
  | "NAV_LEFT_B"
  | "NAV_RIGHT_B"
  | "CHEMCAM_RMI"
  | "MAHLI"
  | "MARDI"

export type PerseveranceCameraName =
  | "MCZ_LEFT"
  | "MCZ_RIGHT"
  | "NAVCAM_LEFT"
  | "NAVCAM_RIGHT"
  | "FRONT_HAZCAM_LEFT_A"
  | "FRONT_HAZCAM_RIGHT_A"
  | "REAR_HAZCAM_LEFT"
  | "REAR_HAZCAM_RIGHT"
  | "SKYCAM"
  | "SHERLOC_WATSON"

export type CameraName = CuriosityCameraName | PerseveranceCameraName
