import type { Metadata } from "next"
import { MarsContent } from "@/components/sections"

export const metadata: Metadata = {
  title: "Mars",
  description:
    "Browse Mars Rover photography from Curiosity and Perseverance.",
  openGraph: {
    title: "Mars",
    description: "Browse Mars Rover photography from Curiosity and Perseverance.",
  },
}

export default function MarsPage() {
  return (
    <section className="min-h-screen px-6 pt-28 pb-16 md:px-10 lg:px-16">
      <header className="mb-12">
        <h1 className="heading-lg text-text-primary">Mars</h1>
        <p className="body-base mt-3 max-w-lg text-text-secondary">
          Surface photography from NASA&apos;s Mars rovers.
          Pick a rover, enter a sol, and explore.
        </p>
      </header>

      <MarsContent />
    </section>
  )
}
