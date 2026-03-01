"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { MarsPhoto, RoverName, CameraName } from "@/types/nasa"
import { useMarsPhotos } from "@/hooks/use-mars-photos"
import {
  staggerContainer,
  staggerItem,
  scaleFade,
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
} from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/* ─── Constants ─── */

const SKELETON_COUNT = 16 as const
const DEFAULT_SOL = "1000" as const

const ROVERS: ReadonlyArray<{
  readonly name: RoverName
  readonly label: string
  readonly cameras: ReadonlyArray<CameraName>
  readonly maxSol: number
  readonly defaultSol: string
}> = [
  {
    name: "curiosity",
    label: "Curiosity",
    cameras: [
      "FHAZ_LEFT_B",
      "RHAZ_LEFT_B",
      "MAST_LEFT",
      "MAST_RIGHT",
      "NAV_LEFT_B",
      "CHEMCAM_RMI",
      "MAHLI",
      "MARDI",
    ],
    maxSol: 4900,
    defaultSol: "1000",
  },
  {
    name: "perseverance",
    label: "Perseverance",
    cameras: [
      "MCZ_LEFT",
      "MCZ_RIGHT",
      "NAVCAM_LEFT",
      "NAVCAM_RIGHT",
      "FRONT_HAZCAM_LEFT_A",
      "REAR_HAZCAM_LEFT",
      "SKYCAM",
      "SHERLOC_WATSON",
    ],
    maxSol: 1800,
    defaultSol: "100",
  },
] as const

const CAMERA_LABELS: Readonly<Record<string, string>> = {
  FHAZ_LEFT_B: "Front Haz L",
  FHAZ_RIGHT_B: "Front Haz R",
  RHAZ_LEFT_B: "Rear Haz L",
  RHAZ_RIGHT_B: "Rear Haz R",
  MAST_LEFT: "Mast L",
  MAST_RIGHT: "Mast R",
  NAV_LEFT_B: "Nav L",
  NAV_RIGHT_B: "Nav R",
  CHEMCAM_RMI: "ChemCam",
  MAHLI: "Hand Lens",
  MARDI: "Descent",
  MCZ_LEFT: "Mastcam-Z L",
  MCZ_RIGHT: "Mastcam-Z R",
  NAVCAM_LEFT: "NavCam L",
  NAVCAM_RIGHT: "NavCam R",
  FRONT_HAZCAM_LEFT_A: "Front Haz L",
  FRONT_HAZCAM_RIGHT_A: "Front Haz R",
  REAR_HAZCAM_LEFT: "Rear Haz L",
  REAR_HAZCAM_RIGHT: "Rear Haz R",
  SKYCAM: "SkyCam",
  SHERLOC_WATSON: "WATSON",
} as const

const getCameraLabel = (camera: string): string =>
  CAMERA_LABELS[camera] ?? camera

/* ─── Rover selector ─── */

type RoverSelectorProps = {
  readonly selected: RoverName
  readonly onSelect: (rover: RoverName) => void
}

const RoverSelector = ({ selected, onSelect }: RoverSelectorProps) => (
  <div className="flex gap-1" role="tablist" aria-label="Select rover">
    {ROVERS.map(({ name, label }) => (
      <button
        key={name}
        role="tab"
        aria-selected={selected === name}
        onClick={() => onSelect(name)}
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
          selected === name
            ? "text-text-primary"
            : "text-text-muted hover:text-text-secondary"
        )}
      >
        {label}
        {selected === name && (
          <motion.div
            layoutId="rover-indicator"
            className="absolute inset-x-2 -bottom-px h-px bg-accent"
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
      </button>
    ))}
  </div>
)

/* ─── Camera filter ─── */

type CameraFilterProps = {
  readonly cameras: ReadonlyArray<CameraName>
  readonly selected: CameraName | "all"
  readonly onSelect: (camera: CameraName | "all") => void
}

const CameraFilter = ({ cameras, selected, onSelect }: CameraFilterProps) => (
  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by camera">
    <button
      onClick={() => onSelect("all")}
      aria-pressed={selected === "all"}
      className={cn(
        "px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-300",
        selected === "all"
          ? "bg-accent/15 text-accent"
          : "bg-surface text-text-muted hover:text-text-secondary"
      )}
    >
      All
    </button>
    {cameras.map((cam) => (
      <button
        key={cam}
        onClick={() => onSelect(cam)}
        aria-pressed={selected === cam}
        className={cn(
          "px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-300",
          selected === cam
            ? "bg-accent/15 text-accent"
            : "bg-surface text-text-muted hover:text-text-secondary"
        )}
      >
        {getCameraLabel(cam)}
      </button>
    ))}
  </div>
)

/* ─── Sol input ─── */

type SolInputProps = {
  readonly value: string
  readonly maxSol: number
  readonly onChange: (val: string) => void
  readonly onSearch: () => void
}

const SolInput = ({ value, maxSol, onChange, onSearch }: SolInputProps) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col gap-1">
      <label htmlFor="sol-input" className="label text-text-muted">Sol</label>
      <input
        id="sol-input"
        type="number"
        min={0}
        max={maxSol}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch()
          }
        }}
        className="h-10 w-28 border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        placeholder="e.g. 1000"
      />
    </div>
    <Button
      onClick={onSearch}
      disabled={value.length === 0}
      className="mt-auto h-10 bg-accent px-5 text-accent-foreground transition-opacity duration-300 hover:opacity-80"
    >
      Explore
    </Button>
  </div>
)

/* ─── Skeleton grid ─── */

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div
        key={`mars-skeleton-${i.toString()}`}
        className="relative aspect-square overflow-hidden bg-surface-elevated"
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-text-muted/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="h-2.5 w-14 rounded-sm bg-text-muted/15" />
          <div className="mt-1.5 h-2.5 w-10 rounded-sm bg-text-muted/15" />
        </div>
      </div>
    ))}
  </div>
)

/* ─── Empty state ─── */

type EmptyStateProps = {
  readonly message: string
  readonly onRetry?: () => void
}

const EmptyState = ({ message, onRetry }: EmptyStateProps) => (
  <motion.div
    className="flex flex-col items-center justify-center py-32"
    variants={scaleFade}
    initial="hidden"
    animate="visible"
  >
    <p className="heading-sm text-text-tertiary">{message}</p>
    <p className="body-sm mt-2 max-w-md text-center text-text-muted">
      Not every sol has photos. Try a different sol number
      or switch to another camera.
    </p>
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="outline"
        className="mt-4 h-9 border-border bg-surface px-5 text-text-secondary transition-colors duration-300 hover:text-text-primary"
      >
        Retry
      </Button>
    )}
  </motion.div>
)

/* ─── Photo lightbox ─── */

type MarsLightboxProps = {
  readonly photo: MarsPhoto | null
  readonly isOpen: boolean
  readonly onClose: () => void
}

const MarsLightbox = ({ photo, isOpen, onClose }: MarsLightboxProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  if (!photo) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden border-border bg-background p-0"
        showCloseButton
      >
        {/* Image */}
        <div className="relative aspect-square max-h-[60vh] w-full shrink-0 overflow-hidden bg-background md:aspect-video">
          <div
            className={cn(
              "absolute inset-0 z-10 bg-surface transition-opacity duration-500",
              isLoaded ? "opacity-0 pointer-events-none" : "opacity-100 animate-pulse"
            )}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.imageUrl}
            alt={`Mars — ${getCameraLabel(photo.camera)}, Sol ${photo.sol.toString()}`}
            className="h-full w-full object-contain"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div>
            <DialogTitle className="heading-md text-text-primary">
              {photo.title}
            </DialogTitle>
            <DialogDescription className="body-base mt-2 text-text-secondary">
              {getCameraLabel(photo.camera)} · Sol {photo.sol.toString()}
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoBlock label="Camera" value={getCameraLabel(photo.camera)} />
            <InfoBlock label="Sol" value={photo.sol.toString()} />
            <InfoBlock label="Credit" value={photo.credit} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const InfoBlock = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div>
    <span className="label text-text-muted">{label}</span>
    <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
  </div>
)

/* ─── Grid item ─── */

type GridItemProps = {
  readonly photo: MarsPhoto
  readonly onClick: () => void
}

const GridItem = ({ photo, onClick }: GridItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.button
      variants={staggerItem}
      className="group relative aspect-square cursor-pointer overflow-hidden"
      onClick={onClick}
      aria-label={`View photo from ${getCameraLabel(photo.camera)}`}
    >
      <Image
        src={photo.imageUrl}
        alt={`Mars — ${getCameraLabel(photo.camera)}, Sol ${photo.sol.toString()}`}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Skeleton overlay — visible until image loads */}
      <div
        className={cn(
          "absolute inset-0 z-10 overflow-hidden bg-surface-elevated transition-opacity duration-500",
          isLoaded ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-text-muted/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="h-2.5 w-14 rounded-sm bg-text-muted/15" />
          <div className="mt-1.5 h-2.5 w-10 rounded-sm bg-text-muted/15" />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/50" />

      {/* Info on hover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="label text-accent">{getCameraLabel(photo.camera)}</p>
        <p className="mt-0.5 text-xs text-text-secondary">
          Sol {photo.sol.toString()}
        </p>
      </div>
    </motion.button>
  )
}

/* ─── Main component ─── */

export const MarsContent = () => {
  const [activeRover, setActiveRover] = useState<RoverName>("curiosity")
  const [activeCamera, setActiveCamera] = useState<CameraName | "all">("all")
  const [solInput, setSolInput] = useState<string>(DEFAULT_SOL)
  const [searchSol, setSearchSol] = useState<string>(DEFAULT_SOL)
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhoto | null>(null)

  const roverConfig = ROVERS.find((r) => r.name === activeRover)

  const { data, isPending, isFetching, isError, isSuccess, refetch } = useMarsPhotos({
    rover: activeRover,
    sol: searchSol,
    camera: activeCamera,
    isEnabled: searchSol.length > 0,
  })

  const photos = data?.photos ?? []
  const isSearching = isPending || isFetching

  if (!roverConfig) {
    return null
  }

  const handleRoverChange = (rover: RoverName): void => {
    const config = ROVERS.find((r) => r.name === rover)
    setActiveRover(rover)
    setActiveCamera("all")
    if (config) {
      setSolInput(config.defaultSol)
      setSearchSol(config.defaultSol)
    }
  }

  const handleSearch = (): void => {
    setSearchSol(solInput)
  }

  return (
    <>
      {/* ── Controls ── */}
      <motion.div
        className="mb-10 space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        {/* Rover tabs */}
        <div className="border-b border-border">
          <RoverSelector selected={activeRover} onSelect={handleRoverChange} />
        </div>

        {/* Sol input + camera filters */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SolInput
            value={solInput}
            maxSol={roverConfig.maxSol}
            onChange={setSolInput}
            onSearch={handleSearch}
          />

          {/* Result count */}
          {!isSearching && photos.length > 0 && (
            <motion.span
              className="body-sm text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
            >
              {photos.length.toString()} photos · Sol {searchSol}
            </motion.span>
          )}
        </div>

        {/* Camera filters */}
        <CameraFilter
          cameras={roverConfig.cameras}
          selected={activeCamera}
          onSelect={setActiveCamera}
        />
      </motion.div>

      {/* ── Grid ── */}
      {isSearching && <SkeletonGrid />}

      {!isSearching && isSuccess && photos.length === 0 && (
        <EmptyState message="No photos for this sol" />
      )}

      {!isSearching && isError && (
        <EmptyState message="Something went wrong" onRetry={() => refetch()} />
      )}

      <AnimatePresence mode="wait">
        {!isSearching && photos.length > 0 && (
          <motion.div
            key={`${activeRover}-${searchSol}-${activeCamera}`}
            className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {photos.map((photo) => (
              <GridItem
                key={photo.id}
                photo={photo}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <MarsLightbox
        photo={selectedPhoto}
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  )
}
