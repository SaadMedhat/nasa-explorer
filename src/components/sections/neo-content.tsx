"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarIcon } from "lucide-react"
import { subDays, addDays, differenceInDays } from "date-fns"
import type { NeoObject } from "@/types/nasa"
import { formatDisplayDate, formatApiDate } from "@/lib/utils/date"
import { useNeoFeed } from "@/hooks/use-neo-feed"
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

const MAX_RANGE_DAYS = 7 as const
const DEFAULT_RANGE_DAYS = 3 as const
/* ─── Helpers ─── */

type ProcessedNeo = {
  readonly object: NeoObject
  readonly diameterMin: number
  readonly diameterMax: number
  readonly diameterAvg: number
  readonly velocity: number
  readonly missDistanceLunar: number
  readonly missDistanceKm: number
  readonly isHazardous: boolean
  readonly approachDate: string
}

const processNeoObject = (neo: NeoObject, date: string): ProcessedNeo => {
  const approach = neo.close_approach_data[0]
  const diameterMin = neo.estimated_diameter.meters.estimated_diameter_min
  const diameterMax = neo.estimated_diameter.meters.estimated_diameter_max

  return {
    object: neo,
    diameterMin,
    diameterMax,
    diameterAvg: (diameterMin + diameterMax) / 2,
    velocity: approach ? parseFloat(approach.relative_velocity.kilometers_per_hour) : 0,
    missDistanceLunar: approach ? parseFloat(approach.miss_distance.lunar) : 0,
    missDistanceKm: approach ? parseFloat(approach.miss_distance.kilometers) : 0,
    isHazardous: neo.is_potentially_hazardous_asteroid,
    approachDate: date,
  }
}

const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", { maximumFractionDigits: 0 })

const formatDecimal = (num: number, digits: number): string =>
  num.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })

/* Map asteroid diameter to visual orb size (px). Clamped 20–72px. */
const getOrbSize = (diameterAvg: number, maxDiameter: number): number => {
  if (maxDiameter === 0) {
    return 28
  }
  const normalized = Math.sqrt(diameterAvg / maxDiameter)
  return Math.max(20, Math.min(72, 20 + normalized * 52))
}

/* Map miss distance to horizontal offset (0–100%). Closer = more left. */
const getProximityOffset = (lunarDist: number, maxLunar: number): number => {
  if (maxLunar === 0) {
    return 50
  }
  return (lunarDist / maxLunar) * 100
}

/* ─── Date picker ─── */

type DatePickerProps = {
  readonly label: string
  readonly date: Date | undefined
  readonly onSelect: (date: Date | undefined) => void
  readonly disabledMatcher: (date: Date) => boolean
}

const DatePicker = ({ label, date, onSelect, disabledMatcher }: DatePickerProps) => (
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
        disabled={disabledMatcher}
        {...(date ? { defaultMonth: date } : {})}
      />
    </PopoverContent>
  </Popover>
)

/* ─── Skeleton ─── */

const SKELETON_ORBS = [36, 24, 48, 28, 20, 40, 32, 26] as const

const SkeletonSummaryBar = () => (
  <div className="mb-10 grid grid-cols-2 gap-px bg-border md:grid-cols-5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={`sum-skel-${i.toString()}`} className="bg-surface p-4 md:p-5">
        <div className="h-2.5 w-16 rounded-sm bg-text-muted/15" />
        <div className="mt-3 h-5 w-20 rounded-sm bg-text-muted/15" />
      </div>
    ))}
  </div>
)

const SkeletonAsteroidRow = ({ orbSize }: { readonly orbSize: number }) => (
  <div className="flex items-center gap-5 py-4">
    {/* Orb */}
    <div className="flex shrink-0 items-center justify-center" style={{ width: "80px" }}>
      <div
        className="animate-pulse rounded-full bg-surface-elevated"
        style={{ width: `${orbSize.toString()}px`, height: `${orbSize.toString()}px` }}
      />
    </div>
    {/* Info */}
    <div className="min-w-0 flex-1">
      <div className="h-4 w-40 rounded-sm bg-text-muted/15" />
      {/* Stats row */}
      <div className="mt-2.5 flex gap-5">
        <div className="h-2.5 w-24 rounded-sm bg-text-muted/12" />
        <div className="h-2.5 w-28 rounded-sm bg-text-muted/12" />
        <div className="h-2.5 w-20 rounded-sm bg-text-muted/12" />
      </div>
      {/* Proximity bar */}
      <div className="mt-3 h-px w-full bg-border">
        <div className="h-full w-1/3 bg-text-muted/20" />
      </div>
    </div>
  </div>
)

const SkeletonDaySection = ({ index }: { readonly index: number }) => (
  <div>
    {/* Date header */}
    <div className="mb-1 flex items-baseline justify-between border-b border-border pb-3">
      <div className="h-4 w-36 rounded-sm bg-text-muted/15" />
      <div className="h-3 w-16 rounded-sm bg-text-muted/12" />
    </div>
    {/* Asteroid rows */}
    <div className="divide-y divide-border/50">
      {Array.from({ length: index === 0 ? 4 : 3 }).map((_, j) => (
        <SkeletonAsteroidRow
          key={`skel-row-${index.toString()}-${j.toString()}`}
          orbSize={SKELETON_ORBS[(index * 4 + j) % SKELETON_ORBS.length] ?? 28}
        />
      ))}
    </div>
  </div>
)

const SkeletonRows = () => (
  <div className="space-y-10">
    <SkeletonSummaryBar />
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonDaySection key={`skel-day-${i.toString()}`} index={i} />
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
      Try adjusting the date range. The API supports up to 7 days.
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

/* ─── Asteroid orb — the core visual element ─── */

type AsteroidOrbProps = {
  readonly neo: ProcessedNeo
  readonly orbSize: number
  readonly onClick: () => void
}

const AsteroidOrb = ({ neo, orbSize, onClick }: AsteroidOrbProps) => (
  <motion.button
    variants={staggerItem}
    className="group relative flex items-center gap-5 py-4 text-left transition-colors duration-300 hover:bg-surface/50"
    onClick={onClick}
    aria-label={`View details for ${neo.object.name}`}
  >
    {/* Orb — size proportional to diameter */}
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: "80px" }}>
      <div
        className={cn(
          "rounded-full transition-transform duration-500 group-hover:scale-110",
          neo.isHazardous
            ? "bg-destructive/20 shadow-[0_0_20px_var(--destructive)]"
            : "bg-accent/10"
        )}
        style={{
          width: `${orbSize.toString()}px`,
          height: `${orbSize.toString()}px`,
        }}
      />
      {neo.isHazardous && (
        <div
          className="absolute rounded-full bg-destructive/10 animate-pulse"
          style={{
            width: `${(orbSize + 12).toString()}px`,
            height: `${(orbSize + 12).toString()}px`,
          }}
        />
      )}
    </div>

    {/* Info */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="heading-sm truncate text-text-primary group-hover:text-accent transition-colors duration-300">
          {neo.object.name.replace(/[()]/g, "")}
        </p>
        {neo.isHazardous && (
          <span className="label shrink-0 text-destructive">Hazardous</span>
        )}
      </div>

      {/* Stats row */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1">
        <StatChip
          label="Diameter"
          value={`${formatNumber(neo.diameterMin)}–${formatNumber(neo.diameterMax)} m`}
        />
        <StatChip
          label="Velocity"
          value={`${formatNumber(neo.velocity)} km/h`}
        />
        <StatChip
          label="Miss distance"
          value={`${formatDecimal(neo.missDistanceLunar, 1)} LD`}
        />
      </div>

      {/* Proximity bar — visual representation of miss distance */}
      <div className="mt-2.5 h-px w-full bg-border">
        <div
          className={cn(
            "h-full transition-all duration-500",
            neo.isHazardous ? "bg-destructive/60" : "bg-accent/30"
          )}
          style={{
            width: `${Math.max(2, 100 - getProximityOffset(neo.missDistanceLunar, 300)).toString()}%`,
          }}
        />
      </div>
    </div>
  </motion.button>
)

const StatChip = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <span className="body-sm text-text-muted">
    <span className="text-text-tertiary">{label}</span>{" "}
    <span className="text-text-secondary">{value}</span>
  </span>
)

/* ─── Detail dialog ─── */

type NeoDetailProps = {
  readonly neo: ProcessedNeo | null
  readonly isOpen: boolean
  readonly onClose: () => void
}

const NeoDetail = ({ neo, isOpen, onClose }: NeoDetailProps) => {
  if (!neo) {
    return null
  }

  const approach = neo.object.close_approach_data[0]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-lg border-border bg-background p-0"
        showCloseButton
      >
        {/* Header with orb */}
        <div className="flex items-center gap-5 border-b border-border p-6">
          <div
            className={cn(
              "shrink-0 rounded-full",
              neo.isHazardous
                ? "bg-destructive/20 shadow-[0_0_24px_var(--destructive)]"
                : "bg-accent/15"
            )}
            style={{
              width: `${Math.max(40, Math.min(64, neo.diameterAvg / 5)).toString()}px`,
              height: `${Math.max(40, Math.min(64, neo.diameterAvg / 5)).toString()}px`,
            }}
          />
          <div>
            <DialogTitle className="heading-md text-text-primary">
              {neo.object.name.replace(/[()]/g, "")}
            </DialogTitle>
            <DialogDescription className="body-sm mt-1 text-text-secondary">
              {neo.isHazardous
                ? "Potentially hazardous asteroid"
                : "Near Earth Object"}
            </DialogDescription>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <DetailCell
            label="Est. diameter (min)"
            value={`${formatDecimal(neo.diameterMin, 1)} m`}
          />
          <DetailCell
            label="Est. diameter (max)"
            value={`${formatDecimal(neo.diameterMax, 1)} m`}
          />
          <DetailCell
            label="Relative velocity"
            value={`${formatNumber(neo.velocity)} km/h`}
          />
          <DetailCell
            label="Miss distance"
            value={`${formatNumber(neo.missDistanceKm)} km`}
          />
          <DetailCell
            label="Miss distance"
            value={`${formatDecimal(neo.missDistanceLunar, 2)} lunar dist.`}
          />
          <DetailCell
            label="Absolute magnitude"
            value={formatDecimal(neo.object.absolute_magnitude_h, 2)}
          />
          {approach && (
            <>
              <DetailCell
                label="Approach date"
                value={formatDisplayDate(approach.close_approach_date)}
              />
              <DetailCell
                label="Orbiting body"
                value={approach.orbiting_body}
              />
            </>
          )}
        </div>

        {/* Hazard indicator */}
        {neo.isHazardous && (
          <div className="border-t border-border px-6 py-4">
            <p className="body-sm text-destructive">
              This asteroid is classified as potentially hazardous
              due to its size and proximity to Earth&apos;s orbit.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const DetailCell = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div className="bg-background p-4">
    <span className="label text-text-muted">{label}</span>
    <p className="mt-1.5 text-sm font-medium text-text-primary">{value}</p>
  </div>
)

/* ─── Day section ─── */

type DaySectionProps = {
  readonly date: string
  readonly asteroids: ReadonlyArray<ProcessedNeo>
  readonly maxDiameter: number
  readonly onSelect: (neo: ProcessedNeo) => void
}

const DaySection = ({ date, asteroids, maxDiameter, onSelect }: DaySectionProps) => {
  const hazardousCount = asteroids.filter((a) => a.isHazardous).length

  return (
    <motion.div variants={staggerItem}>
      {/* Date header */}
      <div className="mb-1 flex items-baseline justify-between border-b border-border pb-3">
        <h3 className="heading-sm text-text-primary">
          {formatDisplayDate(date)}
        </h3>
        <div className="flex items-center gap-3">
          {hazardousCount > 0 && (
            <span className="label text-destructive">
              {hazardousCount.toString()} hazardous
            </span>
          )}
          <span className="body-sm text-text-muted">
            {asteroids.length.toString()} objects
          </span>
        </div>
      </div>

      {/* Asteroids */}
      <motion.div
        className="divide-y divide-border/50"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {asteroids.map((neo) => (
          <AsteroidOrb
            key={neo.object.id}
            neo={neo}
            orbSize={getOrbSize(neo.diameterAvg, maxDiameter)}
            onClick={() => onSelect(neo)}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ─── Summary bar ─── */

type SummaryProps = {
  readonly totalCount: number
  readonly hazardousCount: number
  readonly closestName: string
  readonly closestDistance: number
  readonly largestName: string
  readonly largestDiameter: number
  readonly fastestVelocity: number
}

const SummaryBar = ({
  totalCount,
  hazardousCount,
  closestName,
  closestDistance,
  largestName,
  largestDiameter,
  fastestVelocity,
}: SummaryProps) => (
  <motion.div
    role="region"
    aria-label="Summary statistics"
    className="mb-10 grid grid-cols-2 gap-px bg-border md:grid-cols-5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_EXPO }}
  >
    <SummaryCell label="Total objects" value={totalCount.toString()} />
    <SummaryCell
      label="Hazardous"
      value={hazardousCount.toString()}
      isHighlighted={hazardousCount > 0}
    />
    <SummaryCell
      label="Closest approach"
      value={`${formatDecimal(closestDistance, 1)} LD`}
      subtitle={closestName.replace(/[()]/g, "")}
    />
    <SummaryCell
      label="Largest"
      value={`${formatNumber(largestDiameter)} m`}
      subtitle={largestName.replace(/[()]/g, "")}
    />
    <SummaryCell
      label="Fastest"
      value={`${formatNumber(fastestVelocity)} km/h`}
    />
  </motion.div>
)

const SummaryCell = ({
  label,
  value,
  subtitle,
  isHighlighted,
}: {
  readonly label: string
  readonly value: string
  readonly subtitle?: string
  readonly isHighlighted?: boolean
}) => (
  <div className="bg-background p-4 md:p-5">
    <span className="label text-text-muted">{label}</span>
    <p className={cn(
      "mt-1.5 text-lg font-semibold",
      isHighlighted ? "text-destructive" : "text-text-primary"
    )}>
      {value}
    </p>
    {subtitle && (
      <p className="mt-0.5 truncate text-xs text-text-tertiary">{subtitle}</p>
    )}
  </div>
)

/* ─── Main component ─── */

export const NeoContent = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    subDays(new Date(), DEFAULT_RANGE_DAYS)
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [searchStart, setSearchStart] = useState(
    formatApiDate(subDays(new Date(), DEFAULT_RANGE_DAYS))
  )
  const [searchEnd, setSearchEnd] = useState(formatApiDate(new Date()))
  const [selectedNeo, setSelectedNeo] = useState<ProcessedNeo | null>(null)

  const { data, isPending, isFetching, isError, isSuccess, refetch } = useNeoFeed({
    startDate: searchStart,
    endDate: searchEnd,
    isEnabled: searchStart.length > 0 && searchEnd.length > 0,
  })

  const isSearching = isPending || isFetching

  /* Process all NEO objects into a flat list + grouped by date */
  const { dateGroups, allNeos, maxDiameter, summary } = useMemo(() => {
    if (!data) {
      return { dateGroups: [], allNeos: [], maxDiameter: 0, summary: null }
    }

    const neosByDate = data.near_earth_objects
    const sortedDates = Object.keys(neosByDate).sort()

    const groups = sortedDates.map((date) => {
      const rawList = neosByDate[date]
      if (!rawList) {
        return { date, asteroids: [] as ReadonlyArray<ProcessedNeo> }
      }
      const processed = rawList.map((neo) => processNeoObject(neo, date))
      /* Sort: hazardous first, then by miss distance ascending */
      const sorted = [...processed].sort((a, b) => {
        if (a.isHazardous !== b.isHazardous) {
          return a.isHazardous ? -1 : 1
        }
        return a.missDistanceLunar - b.missDistanceLunar
      })
      return { date, asteroids: sorted }
    })

    const flat = groups.flatMap((g) => g.asteroids)
    const maxDiam = flat.reduce((max, n) => Math.max(max, n.diameterAvg), 0)

    /* Summary stats */
    const closest = flat.reduce<ProcessedNeo | null>(
      (min, n) => (!min || n.missDistanceLunar < min.missDistanceLunar ? n : min),
      null
    )
    const largest = flat.reduce<ProcessedNeo | null>(
      (max, n) => (!max || n.diameterAvg > max.diameterAvg ? n : max),
      null
    )
    const fastest = flat.reduce((max, n) => Math.max(max, n.velocity), 0)
    const hazCount = flat.filter((n) => n.isHazardous).length

    const summaryData: SummaryProps | null = closest && largest
      ? {
          totalCount: flat.length,
          hazardousCount: hazCount,
          closestName: closest.object.name,
          closestDistance: closest.missDistanceLunar,
          largestName: largest.object.name,
          largestDiameter: largest.diameterAvg,
          fastestVelocity: fastest,
        }
      : null

    return { dateGroups: groups, allNeos: flat, maxDiameter: maxDiam, summary: summaryData }
  }, [data])

  const handleSearch = (): void => {
    if (!startDate || !endDate) {
      return
    }
    setSearchStart(formatApiDate(startDate))
    setSearchEnd(formatApiDate(endDate))
  }

  const disableStartDate = (date: Date): boolean => date > new Date()

  const disableEndDate = (date: Date): boolean => {
    if (date > new Date()) {
      return true
    }
    if (startDate && differenceInDays(date, startDate) > MAX_RANGE_DAYS) {
      return true
    }
    if (startDate && date < startDate) {
      return true
    }
    return false
  }

  const handleStartSelect = (date: Date | undefined): void => {
    setStartDate(date)
    /* Auto-adjust end date if it would exceed 7 days */
    if (date && endDate && differenceInDays(endDate, date) > MAX_RANGE_DAYS) {
      setEndDate(addDays(date, MAX_RANGE_DAYS))
    }
  }

  return (
    <>
      {/* ── Controls ── */}
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
            onSelect={handleStartSelect}
            disabledMatcher={disableStartDate}
          />
        </div>

        <div className="flex flex-col gap-1.5" role="group" aria-label="End date">
          <span className="label text-text-muted" aria-hidden="true">To</span>
          <DatePicker
            label="End date"
            date={endDate}
            onSelect={setEndDate}
            disabledMatcher={disableEndDate}
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={!startDate || !endDate}
          className="h-10 bg-accent px-5 text-accent-foreground transition-opacity duration-300 hover:opacity-80"
        >
          Search
        </Button>

        {!isSearching && allNeos.length > 0 && (
          <motion.span
            className="body-sm ml-auto text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
          >
            {allNeos.length.toString()} objects · {searchStart} → {searchEnd}
          </motion.span>
        )}
      </motion.div>

      {/* ── Loading ── */}
      {isSearching && <SkeletonRows />}

      {/* ── Empty / Error ── */}
      {!isSearching && isSuccess && allNeos.length === 0 && (
        <EmptyState message="No objects found" />
      )}

      {!isSearching && isError && (
        <EmptyState message="Something went wrong" onRetry={() => refetch()} />
      )}

      {/* ── Summary ── */}
      {!isSearching && summary && <SummaryBar {...summary} />}

      {/* ── Date sections ── */}
      <AnimatePresence mode="wait">
        {!isSearching && dateGroups.length > 0 && (
          <motion.div
            key={`${searchStart}-${searchEnd}`}
            className="space-y-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {dateGroups.map(({ date, asteroids }) => (
              <DaySection
                key={date}
                date={date}
                asteroids={asteroids}
                maxDiameter={maxDiameter}
                onSelect={setSelectedNeo}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail dialog ── */}
      <NeoDetail
        neo={selectedNeo}
        isOpen={selectedNeo !== null}
        onClose={() => setSelectedNeo(null)}
      />
    </>
  )
}
