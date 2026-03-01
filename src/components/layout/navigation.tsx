"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants"
import { EASE_OUT_EXPO } from "@/lib/motion"

export const Navigation = () => {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 left-0 z-50 w-full"
      aria-label="Main navigation"
    >
      {/* Gradient fade for seamless blending with content */}
      <div className="pointer-events-none absolute inset-0 h-32 bg-gradient-to-b from-background/80 via-background/40 to-transparent" />

      <div className="relative flex items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        {/* Logo / Site title */}
        <Link
          href="/"
          className="group relative font-display text-sm font-bold tracking-widest uppercase text-text-primary transition-colors duration-300 hover:text-accent"
        >
          {SITE_NAME}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-out group-hover:w-full" />
        </Link>

        {/* Nav links — horizontal, responsive spacing */}
        <ul className="flex items-center gap-0 sm:gap-1">
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
                    "relative px-2 py-2 text-[0.625rem] font-medium tracking-wider uppercase transition-colors duration-300 sm:px-4 sm:text-xs",
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
      </div>
    </nav>
  )
}
