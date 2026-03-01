export const SITE_NAME = "NASA Explorer" as const
export const SITE_DESCRIPTION =
  "An editorial experience exploring NASA's imagery and data." as const

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/mars", label: "Mars" },
  { href: "/asteroids", label: "Asteroids" },
] as const

export const ROVER_NAMES = ["curiosity", "perseverance"] as const

export const CURIOSITY_CAMERAS = [
  "FHAZ_LEFT_B",
  "RHAZ_LEFT_B",
  "MAST_LEFT",
  "MAST_RIGHT",
  "NAV_LEFT_B",
  "CHEMCAM_RMI",
  "MAHLI",
  "MARDI",
] as const

export const PERSEVERANCE_CAMERAS = [
  "MCZ_LEFT",
  "MCZ_RIGHT",
  "NAVCAM_LEFT",
  "NAVCAM_RIGHT",
  "FRONT_HAZCAM_LEFT_A",
  "REAR_HAZCAM_LEFT",
  "SKYCAM",
  "SHERLOC_WATSON",
] as const

export const QUERY_STALE_TIMES = {
  APOD: 1000 * 60 * 60,
  MARS: 1000 * 60 * 30,
  NEO: 1000 * 60 * 15,
} as const
