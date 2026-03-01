"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarIcon } from "lucide-react"
import { subDays } from "date-fns"
import type { ApodResponse } from "@/types/nasa"
import { formatDisplayDate, formatApiDate } from "@/lib/utils/date"
import { useApodRange, useApodRandom } from "@/hooks/use-apod-gallery"
import {
  staggerContainer,
  staggerItem,
  scaleFade,
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
} from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/* ─── Constants ─── */

const RANDOM_COUNT = 18 as const
const DEFAULT_RANGE_DAYS = 14 as const
const SKELETON_COUNT = 12 as const

/* ─── Types ─── */

type GalleryMode = "range" | "random"

/* ─── Grid size pattern for visual variety ─── */

const GRID_PATTERN = [
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
] as const

const getGridClass = (index: number): string =>
  GRID_PATTERN[index % GRID_PATTERN.length] ?? "col-span-1 row-span-1"

/* ─── Date picker sub-component ─── */

type DatePickerProps = {
  readonly label: string
  readonly date: Date | undefined
  readonly onSelect: (date: Date | undefined) => void
}

const DatePicker = ({ label, date, onSelect }: DatePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "h-10 justify-start gap-2 border-border bg-surface px-4 text-left text-sm font-normal",
          !date && "text-text-muted"
        )}
      >
        <CalendarIcon className="size-3.5 text-text-tertiary" />
        {date ? formatDisplayDate(formatApiDate(date)) : label}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto border-border bg-surface p-0" align="start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelect}
        disabled={{ after: new Date() }}
        {...(date ? { defaultMonth: date } : {})}
      />
    </PopoverContent>
  </Popover>
)

/* ─── Skeleton grid ─── */

const SkeletonGrid = () => (
  <div className="grid auto-rows-[180px] grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div
        key={`skeleton-${i.toString()}`}
        className={cn(
          "relative overflow-hidden bg-surface-elevated",
          getGridClass(i)
        )}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-text-muted/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="h-2.5 w-16 rounded-sm bg-text-muted/15" />
          <div className="mt-2 h-3 w-28 rounded-sm bg-text-muted/15" />
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
    <p className="body-sm mt-2 text-text-muted">
      Try adjusting the date range or load random photos.
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

/* ─── Lightbox ─── */

type LightboxProps = {
  readonly apod: ApodResponse | null
  readonly isOpen: boolean
  readonly onClose: () => void
}

const LightboxImage = ({ src, alt }: { readonly src: string; readonly alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative aspect-video max-h-[50vh] w-full shrink-0 overflow-hidden bg-background">
      {/* Skeleton overlay — fades out when image loads */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-surface transition-opacity duration-500",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100 animate-pulse"
        )}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}

const Lightbox = ({ apod, isOpen, onClose }: LightboxProps) => {
  if (!apod) {
    return null
  }

  const isVideoMedia = apod.media_type === "video"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden border-border bg-background p-0"
        showCloseButton
      >
        {/* Media — fixed height, no scroll */}
        {!isVideoMedia && (
          <LightboxImage src={apod.url} alt={apod.title} />
        )}

        {isVideoMedia && (
          <div className="relative aspect-video w-full shrink-0">
            <iframe
              src={apod.url}
              title={apod.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Info — scrollable */}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          <div>
            <span className="label text-accent">{formatDisplayDate(apod.date)}</span>
            <DialogTitle className="heading-md mt-2 text-text-primary">
              {apod.title}
            </DialogTitle>
          </div>
          <DialogDescription className="body-base text-text-secondary" asChild>
            <p>{apod.explanation}</p>
          </DialogDescription>
          {apod.copyright && (
            <p className="body-sm text-text-muted">© {apod.copyright.trim()}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Grid item ─── */

type GridItemProps = {
  readonly apod: ApodResponse
  readonly index: number
  readonly onClick: () => void
}

const GridItem = ({ apod, index, onClick }: GridItemProps) => {
  const isVideoMedia = apod.media_type === "video"
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.button
      variants={staggerItem}
      className={cn(
        "group relative cursor-pointer overflow-hidden",
        getGridClass(index)
      )}
      onClick={onClick}
      aria-label={`View ${apod.title}`}
    >
      {/* Thumbnail */}
      {!isVideoMedia ? (
        <Image
          src={apod.url}
          alt={apod.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-surface">
          <span className="label text-text-muted">Video</span>
        </div>
      )}

      {/* Skeleton overlay — visible until image loads */}
      {!isVideoMedia && (
        <div
          className={cn(
            "absolute inset-0 z-10 overflow-hidden bg-surface-elevated transition-opacity duration-500",
            isLoaded ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-text-muted/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="h-2.5 w-16 rounded-sm bg-text-muted/15" />
            <div className="mt-2 h-3 w-28 rounded-sm bg-text-muted/15" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/50" />

      {/* Info on hover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="label text-accent">{formatDisplayDate(apod.date)}</p>
        <p className="mt-1 text-sm font-medium text-text-primary line-clamp-2">
          {apod.title}
        </p>
      </div>
    </motion.button>
  )
}

/* ─── Main gallery content ─── */

export const GalleryContent = () => {
  const [mode, setMode] = useState<GalleryMode>("random")
  const [startDate, setStartDate] = useState<Date | undefined>(
    subDays(new Date(), DEFAULT_RANGE_DAYS)
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [randomKey, setRandomKey] = useState(0)
  const [selectedApod, setSelectedApod] = useState<ApodResponse | null>(null)

  const isRangeReady =
    mode === "range" &&
    startDate !== undefined &&
    endDate !== undefined

  const rangeQuery = useApodRange({
    startDate: startDate ? formatApiDate(startDate) : "",
    endDate: endDate ? formatApiDate(endDate) : "",
    isEnabled: isRangeReady,
  })

  const randomQuery = useApodRandom({
    count: RANDOM_COUNT,
    isEnabled: mode === "random",
    triggerKey: randomKey,
  })

  const activeQuery = mode === "range" ? rangeQuery : randomQuery
  const photos = activeQuery.data ?? []
  const imagePhotos = photos.filter((p) => p.media_type === "image")
  const isLoading = activeQuery.isPending || activeQuery.isFetching

  const handleShuffle = useCallback(() => {
    setMode("random")
    setRandomKey((prev) => prev + 1)
  }, [])

  const handleDateSearch = useCallback(() => {
    setMode("range")
  }, [])

  return (
    <>
      {/* ── Controls bar ── */}
      <motion.div
        className="mb-10 flex flex-wrap items-end gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        <div className="flex flex-col gap-1.5" role="group" aria-label="Start date">
          <span className="label text-text-muted" aria-hidden="true">From</span>
          <DatePicker
            label="Start date"
            date={startDate}
            onSelect={setStartDate}
          />
        </div>

        <div className="flex flex-col gap-1.5" role="group" aria-label="End date">
          <span className="label text-text-muted" aria-hidden="true">To</span>
          <DatePicker
            label="End date"
            date={endDate}
            onSelect={setEndDate}
          />
        </div>

        <Button
          onClick={handleDateSearch}
          disabled={!startDate || !endDate}
          className="h-10 bg-accent px-5 text-accent-foreground transition-opacity duration-300 hover:opacity-80"
        >
          Search
        </Button>

        <div className="mx-2 hidden h-6 w-px bg-border md:block" />

        <Button
          onClick={handleShuffle}
          variant="outline"
          className="h-10 border-border bg-surface px-5 text-text-secondary transition-colors duration-300 hover:text-text-primary"
        >
          Surprise me
        </Button>

        {/* Result count */}
        {!isLoading && imagePhotos.length > 0 && (
          <motion.span
            className="body-sm ml-auto text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
          >
            {imagePhotos.length.toString()} results
          </motion.span>
        )}
      </motion.div>

      {/* ── Grid ── */}
      {isLoading && <SkeletonGrid />}

      {!isLoading && imagePhotos.length === 0 && activeQuery.isSuccess && (
        <EmptyState message="No images found" />
      )}

      {!isLoading && activeQuery.isError && (
        <EmptyState message="Something went wrong" onRetry={() => activeQuery.refetch()} />
      )}

      <AnimatePresence mode="wait">
        {!isLoading && imagePhotos.length > 0 && (
          <motion.div
            key={`${mode}-${startDate?.toISOString() ?? ""}-${endDate?.toISOString() ?? ""}-${randomKey.toString()}`}
            className="grid auto-rows-[180px] grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {imagePhotos.map((apod, index) => (
              <GridItem
                key={apod.date}
                apod={apod}
                index={index}
                onClick={() => setSelectedApod(apod)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <Lightbox
        apod={selectedApod}
        isOpen={selectedApod !== null}
        onClose={() => setSelectedApod(null)}
      />
    </>
  )
}
