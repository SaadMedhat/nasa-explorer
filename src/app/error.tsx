"use client"

import { motion } from "framer-motion"
import { scaleFade } from "@/lib/motion"
import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  readonly error: Error & { readonly digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        className="max-w-md text-center"
        variants={scaleFade}
        initial="hidden"
        animate="visible"
      >
        <h1 className="heading-lg text-text-primary">Something went wrong</h1>
        <p className="body-base mt-3 text-text-secondary">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          onClick={reset}
          className="mt-6 h-10 bg-accent px-6 text-accent-foreground transition-opacity duration-300 hover:opacity-80"
        >
          Try again
        </Button>
      </motion.div>
    </section>
  )
}
