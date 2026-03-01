import type { Variants, Transition, Easing } from "framer-motion"

/* ─── Custom easing curves ─── */

export const EASE_OUT_EXPO: Easing = [0.16, 1, 0.3, 1]
export const EASE_OUT_QUART: Easing = [0.25, 1, 0.5, 1]
export const EASE_IN_OUT_CUBIC: Easing = [0.65, 0, 0.35, 1]

/* ─── Shared transition presets ─── */

export const TRANSITION_SMOOTH: Transition = {
  duration: 0.7,
  ease: EASE_OUT_EXPO,
}

export const TRANSITION_SNAPPY: Transition = {
  duration: 0.4,
  ease: EASE_OUT_QUART,
}

/* ─── Fade in ─── */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

/* ─── Slide up with fade ─── */

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
}

/* ─── Slide in from left ─── */

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
}

/* ─── Scale fade (subtle) ─── */

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
}

/* ─── Blur in ─── */

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
}

/* ─── Stagger container ─── */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

/* ─── Stagger item (pair with staggerContainer) ─── */

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
}

/* ─── Page transition ─── */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: EASE_IN_OUT_CUBIC,
    },
  },
}
