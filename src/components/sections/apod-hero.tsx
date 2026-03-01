"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import type { ApodResponse } from "@/types/nasa"
import { formatDisplayDate } from "@/lib/utils/date"
import { EASE_OUT_EXPO, EASE_OUT_QUART } from "@/lib/motion"

type ApodHeroProps = {
  readonly apod: ApodResponse
}

const PARALLAX_DISTANCE = 80 as const
const CLAMP_LINES = 3 as const

/* ─── Video type detection ─── */

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"] as const

const isDirectVideoUrl = (url: string): boolean =>
  VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext))

const isEmbeddableUrl = (url: string): boolean =>
  url.includes("youtube.com") ||
  url.includes("youtu.be") ||
  url.includes("vimeo.com") ||
  url.includes("/embed/")

const getEmbedUrl = (url: string): string => {
  if (url.includes("/embed/")) {
    return url
  }

  const ytMatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(url)
  if (ytMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&loop=1`
  }

  const vimeoMatch = /vimeo\.com\/(\d+)/.exec(url)
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`
  }

  return url
}

/* ─── Main hero ─── */

export const ApodHero = ({ apod }: ApodHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const isVideoMedia = apod.media_type === "video"

  /* Parallax: media drifts upward as user scrolls past */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_DISTANCE])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  /* Determine video rendering strategy */
  const isDirectVideo = isVideoMedia && isDirectVideoUrl(apod.url)
  const isEmbedVideo = isVideoMedia && isEmbeddableUrl(apod.url)

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      aria-label={`Astronomy Picture of the Day: ${apod.title}`}
    >
      {/* ── Background media ── */}

      {/* Static image with parallax */}
      {!isVideoMedia && (
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src={apod.hdurl ?? apod.url}
            alt={apod.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      )}

      {/* Direct video file (MP4, WebM, etc.) with parallax */}
      {isDirectVideo && (
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          style={{ y: imageY, scale: imageScale }}
        >
          <video
            src={apod.url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            aria-label={apod.title}
          />
        </motion.div>
      )}

      {/* Embeddable video (YouTube, Vimeo) */}
      {isEmbedVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <iframe
            src={getEmbedUrl(apod.url)}
            title={apod.title}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Fallback for unknown video URLs */}
      {isVideoMedia && !isDirectVideo && !isEmbedVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <iframe
            src={apod.url}
            title={apod.title}
            className="h-full w-full"
            allow="autoplay"
          />
        </div>
      )}

      {/* ── Gradient overlay — tall, multi-stop ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      >
        {/* Bottom gradient — where text lives */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(to top,",
              "var(--background) 0%,",
              "color-mix(in oklch, var(--background) 92%, transparent) 8%,",
              "color-mix(in oklch, var(--background) 70%, transparent) 25%,",
              "color-mix(in oklch, var(--background) 30%, transparent) 50%,",
              "transparent 75%)",
            ].join(" "),
          }}
        />
        {/* Top vignette — subtle */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklch, var(--background) 40%, transparent) 0%, transparent 30%)",
          }}
        />
      </motion.div>

      {/* ── Content overlay ── */}
      <div className="relative z-20 flex h-full flex-col justify-end px-6 pb-24 md:px-10 lg:px-16">
        <div className="max-w-2xl">
          {/* Date label */}
          <motion.span
            className="label mb-4 inline-block text-accent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: EASE_OUT_EXPO,
            }}
          >
            {formatDisplayDate(apod.date)}
          </motion.span>

          {/* Title */}
          <motion.h1
            className="heading-xl mb-6 text-text-primary text-balance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.9,
              ease: EASE_OUT_EXPO,
            }}
          >
            {apod.title}
          </motion.h1>

          {/* Explanation — expandable */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.8,
              ease: EASE_OUT_EXPO,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={isExpanded ? "expanded" : "collapsed"}
                className="body-base text-text-secondary"
                style={
                  isExpanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: CLAMP_LINES,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              >
                {apod.explanation}
              </motion.p>
            </AnimatePresence>

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="group mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors duration-300 hover:text-text-primary"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse explanation" : "Expand explanation"}
            >
              <span>{isExpanded ? "Read less" : "Read more"}</span>
              <motion.span
                className="inline-block"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                aria-hidden="true"
              >
                ↓
              </motion.span>
            </button>
          </motion.div>

          {/* Copyright */}
          {apod.copyright && (
            <motion.p
              className="body-sm text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.9,
                duration: 0.8,
                ease: EASE_OUT_EXPO,
              }}
            >
              © {apod.copyright.trim()}
            </motion.p>
          )}
        </div>
      </div>

    </section>
  )
}
