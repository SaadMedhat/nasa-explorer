"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants"
import {
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
  EASE_IN_OUT_CUBIC,
  staggerContainer,
  staggerItem,
} from "@/lib/motion"

/* ─── Hamburger line variants ─── */

const topLineVariants = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: 45, y: 5 },
}

const bottomLineVariants = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: -45, y: -5 },
}

/* ─── Sidebar overlay variants ─── */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
}

export const Navigation = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  /* Close sidebar on route change */
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  /* Escape key closes sidebar */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  /* Lock body scroll when sidebar is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 z-50 w-full"
        aria-label="Main navigation"
      >
        {/* Gradient fade for seamless blending with content */}
        <div className="pointer-events-none absolute inset-0 h-32 bg-linear-to-b from-background/80 via-background/40 to-transparent" />

        <div className="relative flex items-center justify-between px-6 py-5 md:px-10 lg:px-16">
          {/* Logo / Site title */}
          <Link
            href="/"
            className="group relative z-10 font-display text-sm font-bold tracking-widest uppercase text-text-primary transition-colors duration-300 hover:text-accent"
          >
            {SITE_NAME}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-out group-hover:w-full" />
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href)

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "relative px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors duration-300",
                      isActive
                        ? "text-accent"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-accent"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Subtle time indicator — current date */}
          <motion.span
            className="label hidden text-text-muted lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.8,
              ease: EASE_OUT_EXPO,
            }}
            aria-hidden="true"
          >
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </motion.span>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <motion.span
              className="block h-[1.5px] w-5 origin-center bg-text-primary"
              variants={topLineVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            />
            <motion.span
              className="block h-[1.5px] w-5 origin-center bg-text-primary"
              variants={bottomLineVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            />
          </button>
        </div>
      </nav>

      {/* ─── Mobile sidebar ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col justify-center bg-background px-10 md:hidden"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                type: "tween",
                duration: 0.5,
                ease: EASE_OUT_EXPO,
              }}
            >
              {/* Close button — top right */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-6 top-5 flex h-10 w-10 flex-col items-center justify-center gap-[6px]"
                aria-label="Close menu"
              >
                <motion.span
                  className="block h-[1.5px] w-5 origin-center bg-text-primary"
                  initial={{ rotate: 0, y: 0 }}
                  animate={{ rotate: 45, y: 5 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                />
                <motion.span
                  className="block h-[1.5px] w-5 origin-center bg-text-primary"
                  initial={{ rotate: 0, y: 0 }}
                  animate={{ rotate: -45, y: -5 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                />
              </button>

              {/* Nav links — staggered */}
              <motion.ul
                className="flex flex-col gap-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {NAV_ITEMS.map(({ href, label }) => {
                  const isActive =
                    href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(href)

                  return (
                    <motion.li key={href} variants={staggerItem}>
                      <Link
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center gap-4 py-3 font-display text-3xl font-bold tracking-tight transition-colors duration-300",
                          isActive
                            ? "text-accent"
                            : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {isActive && (
                          <span
                            className="h-px w-6 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        {label}
                      </Link>
                    </motion.li>
                  )
                })}
              </motion.ul>

              {/* Bottom info */}
              <motion.p
                className="label mt-16 text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: EASE_IN_OUT_CUBIC }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
