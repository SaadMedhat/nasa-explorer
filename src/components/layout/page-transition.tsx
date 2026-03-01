"use client"

import { motion } from "framer-motion"
import { pageTransition } from "@/lib/motion"

type PageTransitionProps = {
  readonly children: React.ReactNode
  readonly className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
)
