import type { Metadata } from "next"
import { NeoContent } from "@/components/sections"

export const metadata: Metadata = {
  title: "Asteroids",
  description: "Track Near Earth Objects and their close approaches.",
  openGraph: {
    title: "Asteroids",
    description: "Track Near Earth Objects and their close approaches.",
  },
}

export default function AsteroidsPage() {
  return (
    <section className="min-h-screen px-6 pt-28 pb-16 md:px-10 lg:px-16">
      <header className="mb-12">
        <h1 className="heading-lg text-text-primary">Near Earth Objects</h1>
        <p className="body-base mt-3 max-w-lg text-text-secondary">
          Asteroids and comets passing close to Earth.
          Select a date range to explore.
        </p>
      </header>

      <NeoContent />
    </section>
  )
}
